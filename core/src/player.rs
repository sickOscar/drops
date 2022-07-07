use std::sync::atomic::{AtomicUsize, Ordering};
use std::collections::HashMap;
use std::cell::{RefCell};


use crate::utils::{Colors, Position};

const STARTING_POSITIONS:[(usize, usize); crate::MAX_PLAYERS as usize] = [
    (1, 1),
    (crate::BOARD_SIZE / 2, 1),
    (crate::BOARD_SIZE - 2, 1),
    (crate::BOARD_SIZE - 2, crate::BOARD_SIZE / 2),
    (crate::BOARD_SIZE - 2, crate::BOARD_SIZE - 2),
    (crate::BOARD_SIZE / 2, crate::BOARD_SIZE - 2),
    (1, crate::BOARD_SIZE - 2),
    (1, crate::BOARD_SIZE / 2),
];

pub struct Player {
    pub id: i32,
    // name: String,
    pub color: Colors,
    pub starting_position: Position,
    pub military: f32,
    pub production: f32,
    pub research: f32,
    pub resources: i32,
    pub owned_cells: i32,
}

impl Player {
    pub fn spend_resources(&mut self, amount: i32) {
        self.resources -= amount;
    }
    pub fn gain_resources(&mut self, amount: i32) {
        self.resources += amount;
    }
}

pub fn create_players_hashmap() -> HashMap<i32, RefCell<Player>> {
    let mut players: HashMap<i32, RefCell<Player>> = HashMap::new();
    players
}

pub fn create_player(id: i32) -> Player{

    static COUNTER:AtomicUsize = AtomicUsize::new(0);
    COUNTER.fetch_add(1, Ordering::Relaxed);

    println!("player counter {}", COUNTER.load(Ordering::Relaxed));

    let starting_position = Position {
        x: STARTING_POSITIONS[COUNTER.load(Ordering::Relaxed) % (crate::MAX_PLAYERS as usize)].0 as i32,
        y: STARTING_POSITIONS[COUNTER.load(Ordering::Relaxed) % (crate::MAX_PLAYERS as usize)].1 as i32,
    };
    println!("player {} starting position {:?}", &id, &starting_position);

    let player = Player {
        id,
        color: Colors::Red,
        starting_position: Position {
            x: starting_position.x,
            y: starting_position.y
        },
        military: 0.33,
        production: 0.33,
        research: 0.34,
        resources: 0,
        owned_cells: 0,
    };
    player
}