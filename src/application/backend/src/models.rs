use serde::{Deserialize, Serialize};
use mongodb::bson::oid::ObjectId;
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Potion {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Form")]
    pub form: String,
    #[serde(rename = "Lore")]
    pub lore: String,
    #[serde(rename = "PotionSetId")]
    pub potion_set_id: i32,
    #[serde(rename = "Id")]
    pub id: i32,
    #[serde(rename = "Ingredients")]
    pub ingredients: Option<HashMap<String, i32>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PotionNames {
    pub names: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PotionSet {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Description")]
    pub description: String,
    #[serde(rename = "_id")]
    pub id: ObjectId,
    #[serde(rename = "Id")]
    pub set_id: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ingredient {
    #[serde(rename = "Name")]
    pub name: String,    
    #[serde(rename = "Id")]
    pub id: i32, 
    #[serde(rename = "SessionPrice")]
    pub session_price: i32,
    #[serde(rename = "SessionInventory")]
    pub session_inventory: i32,
}
#[derive(Debug, Serialize, Deserialize)]
pub struct PotionSets {
    pub sets: Vec<PotionSet>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PotionsResponse {
    pub potions: Vec<Potion>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IngredientsResponse {
    pub ingredients: Vec<Ingredient>,
}
