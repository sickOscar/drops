use std::sync::atomic::{AtomicUsize, Ordering};
use std::collections::HashMap;
use std::cell::{RefCell};


use crate::utils::{Colors, Position};



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
    pub fn update_resources(&mut self) {
        let resource_gain = super::RESOURCES_AT_END_ROUND as f32 * self.production;
        self.gain_resources(resource_gain as i32);
    }
}

pub fn add_players_to_field(field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>) {
    for (_player_id, player) in players {
        field[player.borrow().starting_position.x as usize][player.borrow().starting_position.y as usize] = player.borrow().id;
    }
}


pub fn update_players_resources(players: &mut HashMap<i32, RefCell<Player>>) {
    for (_player_id, player) in players {
        let mut player_ref = player.borrow_mut();
        player_ref.update_resources();
    }
}

pub fn create_players_hashmap() -> HashMap<i32, RefCell<Player>> {
    HashMap::new()
}

pub fn create_player(id: i32) -> Player{

    static COUNTER:AtomicUsize = AtomicUsize::new(0);
    COUNTER.fetch_add(1, Ordering::Relaxed);

    println!("player counter {}", COUNTER.load(Ordering::Relaxed));

    let starting_position = Position {
        x: super::STARTING_POSITIONS[COUNTER.load(Ordering::Relaxed) % (crate::MAX_PLAYERS as usize)].0 as i32,
        y: super::STARTING_POSITIONS[COUNTER.load(Ordering::Relaxed) % (crate::MAX_PLAYERS as usize)].1 as i32,
    };
    println!("player {} starting position {:?}", &id, &starting_position);

    let player = Player {
        id,
        color: match id%2 {
            0 => Colors::Red,
            1 => Colors::Blue,
            _ => Colors::Yellow,
        },
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