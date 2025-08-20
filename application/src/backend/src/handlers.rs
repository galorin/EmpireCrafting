use actix_web::{get, post, web, Result, error};
use mongodb::Client;
use crate::models::{PotionNames, PotionSets, PotionsResponse, IngredientsResponse, Potion, Ingredient, PotionSet};
use crate::db::{fetch_and_extract};
use std::collections::HashMap;
use mongodb::bson::{doc, Document};
use serde_json;
use serde::Deserialize;


#[get("/api/potions/names")]
pub async fn get_potion_names(client: web::Data<Client>) -> Result<web::Json<PotionNames>> {
    let potions: Vec<Potion> = fetch_and_extract(&client.clone(), "Potions", None).await?;
    let names: Vec<String> = potions.iter().map(|potion| potion.name.clone()).collect();
    Ok(web::Json(PotionNames { names }))
}

#[get("/api/potionsets")]
pub async fn get_potion_sets(client: web::Data<Client>) -> Result<web::Json<PotionSets>> {
    let sets: Vec<PotionSet> = fetch_and_extract(&client.clone(), "PotionSets", None).await?;
    Ok(web::Json(PotionSets { sets }))
}

#[get("/api/potions")]
pub async fn get_potions_by_set(client: web::Data<Client>, web::Query(query): web::Query<HashMap<String, String>>) -> Result<web::Json<PotionsResponse>> {
    let set_id_str = query.get("set_id").ok_or_else(|| error::ErrorBadRequest("Missing set_id"))?;
    let set_id: i32 = set_id_str.parse().map_err(|_| error::ErrorBadRequest("Invalid set_id"))?;
    let filter = doc! { "PotionSetId": set_id };
    let potions: Vec<Potion> = fetch_and_extract(&client.clone(), "Potions", Some(filter)).await?;
    Ok(web::Json(PotionsResponse { potions }))
}

#[get("/api/potions/all")]
pub async fn get_all_potions(client: web::Data<Client>) -> Result<web::Json<PotionsResponse>> {
    let potions: Vec<Potion> = fetch_and_extract(&client.clone(), "Potions", None).await?;
    Ok(web::Json(PotionsResponse { potions }))
}

#[get("/api/ingredients")]
pub async fn get_ingredients(client: web::Data<Client>) -> Result<web::Json<IngredientsResponse>> {
    let ingredients: Vec<Ingredient> = fetch_and_extract(&client.clone(), "Ingredients", None).await?;
    Ok(web::Json(IngredientsResponse { ingredients })) 
}

#[derive(Debug, Deserialize)]
pub struct UpdateIngredientPriceRequest {
    pub ingredient_id: i32,
    #[serde(alias = "session_price")]
    pub session_price: i32,

    #[serde(alias = "session_inventory")]
    pub session_inventory: i32,
}

#[post("/api/ingredients/price")]
pub async fn update_ingredient_price(client: web::Data<Client>, req: web::Json<UpdateIngredientPriceRequest>) -> Result<web::Json<serde_json::Value>> {
    // Input validation
    if req.session_price < 0 {
        return Err(error::ErrorBadRequest("Session price cannot be negative"));
    }

    if req.session_inventory < 0 {
        return Err(error::ErrorBadRequest("Session inventory cannot be negative"));
    }

    let collection = client.database("empireExperiment").collection::<Document>("Ingredients");

    let filter = doc! { "Id": req.ingredient_id };
    let update = doc! { "$set": { "SessionPrice": req.session_price,  "SessionInventory": req.session_inventory} };

    let result = collection.update_one(filter, update).await.map_err(|e| {
        eprintln!("Error updating ingredient price: {:?}", e);
        error::ErrorInternalServerError("Failed to update ingredient price")
    })?;

    if result.modified_count == 0 {
        return Err(error::ErrorNotFound("Ingredient not found"));
    }

    Ok(web::Json(serde_json::json!({ "message": "Ingredient price updated successfully" })))
}
