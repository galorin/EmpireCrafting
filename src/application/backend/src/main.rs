use actix_cors::Cors;
use actix_web::{web, App, HttpServer, http};
use mongodb::Client;
use dotenv::dotenv;

mod models;
mod db;
mod handlers;

use db::get_mongo_client;
use handlers::*;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();
    std::env::set_var("RUST_LOG", "debug");
    env_logger::init();

    let client: Client = get_mongo_client().await.expect("Failed to initialize MongoDB client");

    println!("Starting server at http://127.0.0.1:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "OPTIONS"])
            .allowed_headers(vec![http::header::AUTHORIZATION, http::header::ACCEPT])
            .allowed_header(http::header::CONTENT_TYPE)
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(client.clone()))
            .wrap(cors)
            .service(get_potion_names)
            .service(get_potion_sets)
            .service(get_potions_by_set)
            .service(get_all_potions)
            .service(get_ingredients)
            .service(update_ingredient_price)
    })
    .bind(("0.0.0.0", 8080))?
    .run()
    .await
}
