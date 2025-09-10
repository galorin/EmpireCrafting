use mongodb::{
    bson::{doc, Bson, Document},
    options::{ClientOptions, FindOptions},
    Client, Collection,
};
use crate::models::{Potion, Ingredient, PotionSet};
use actix_web::{Result, error};
use dotenv::dotenv;
use futures::TryStreamExt;

pub async fn get_mongo_client() -> mongodb::error::Result<Client> {
    dotenv().ok();
    let mongodb_uri = std::env::var("MONGODB_URI").expect("MONGODB_URI must be set");
    let client_options = ClientOptions::parse(mongodb_uri).await?;
    Client::with_options(client_options)
}

pub fn get_collection<'a>(client: &'a Client, collection_name: &str) -> Collection<Document> {
    let db_name = std::env::var("MONGODB_DATABASE")
        .unwrap_or_else(|_| "empireExperiment".to_string());
    client.database(&db_name).collection::<Document>(collection_name)
}

pub trait Extractable: Sized {
    fn extract(document: &Document) -> Option<Self>;
}

impl Extractable for Potion {
    fn extract(document: &Document) -> Option<Self> {
        let name = document.get("Name").and_then(Bson::as_str).map(|s| s.to_string()); 
        let form = document.get("Form").and_then(Bson::as_str).map(|s| s.to_string());
        let lore = document.get("Lore").and_then(Bson::as_str).map(|s| s.to_string());
        let potion_set_id = document.get("PotionSetId").and_then(Bson::as_i32);
        let id = document.get("Id").and_then(Bson::as_i32);
        let ingredients = document.get("Ingredients").and_then(Bson::as_document).map(|doc| {
            doc.iter()
                .filter_map(|(key, value)| {
                    if let Bson::Int32(val) = value {
                        Some((key.clone(), *val))
                    } else {
                        None
                    }
                })
                .collect()
        });

        match (name, form, lore, potion_set_id, id) {
            (Some(name), Some(form), Some(lore), Some(potion_set_id), Some(id)) => {
                Some(Potion { name, form, lore, potion_set_id, id, ingredients })
            }
            _ => {
                eprintln!("Skipping Potion due to missing fields: {:?}", document);
                None
            }
        }
    }
}

impl Extractable for Ingredient {
    fn extract(document: &Document) -> Option<Self> {
        let name = document.get("Name").and_then(Bson::as_str).map(|s| s.to_string());
        let id = document.get("Id").and_then(Bson::as_i32)?;
        let session_price = document.get("SessionPrice").and_then(Bson::as_i32).unwrap_or(0);
        let session_inventory = document.get("SessionInventory").and_then(Bson::as_i32).unwrap_or(0);

        match (name, Some(id)) {
            (Some(name), Some(id)) => Some(Ingredient {
                name,
                id,
                session_price,
                session_inventory,
            }),
            _ => {
                eprintln!("Skipping Ingredient due to missing fields: {:?}", document);
                None
            }
        }
    }
}

impl Extractable for PotionSet {
    fn extract(document: &Document) -> Option<Self> {
        let name = document.get("Name").and_then(Bson::as_str).map(|s| s.to_string());
        let description = document.get("Description").and_then(Bson::as_str).map(|s| s.to_string());
        let id = document.get("_id").and_then(Bson::as_object_id).map(|oid| oid);
        let set_id = document.get("Id").and_then(Bson::as_i32);

        match (name, description, id, set_id) {
            (Some(name), Some(description), Some(id), Some(set_id)) => {
                Some(PotionSet { name, description, id, set_id })
            }
            _ => {
                eprintln!("Skipping PotionSet due to missing fields: {:?}", document);
                None
            }
        }
    }
}

pub async fn fetch_and_extract<T: Extractable + Send + Sync>(
    client: &Client, 
    collection_name: &str, 
    filter: Option<Document>,
    sort: Option<Document>
) -> Result<Vec<T>> {
    let collection = get_collection(client, collection_name);
    let find_options = FindOptions::builder().sort(sort).build();

    let cursor = collection
        .find(filter.unwrap_or_else(|| doc! {}))
        .with_options(find_options)
        .await
        .map_err(|e| {
            eprintln!("Error executing find: {:?}", e);
            error::ErrorInternalServerError(format!("Failed to query {}", collection_name))
        })?;

    let documents: Vec<Document> = cursor
        .try_collect()
        .await
        .map_err(|e| {
            eprintln!("Error collecting documents: {:?}", e);
            error::ErrorInternalServerError(format!("Failed to collect data from {}", collection_name))
        })?;

    let items: Vec<T> = documents
        .iter()
        .filter_map(|doc| T::extract(doc))
        .collect();

    Ok(items)
}
