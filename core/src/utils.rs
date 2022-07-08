use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum Colors {
    Red,
    Blue,
    Yellow,
    // Green,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Position {
    pub x: i32,
    pub y: i32,
}