use std::sync::atomic::{AtomicUsize, Ordering};
use std::collections::HashMap;
use std::cell::{RefCell};
use serde::{Serialize};


use crate::utils::{Colors, Position};
use crate::milestones::{MILESTONES};

#[derive(Serialize, Debug)]
pub struct Player {
    pub id: i32,
    pub color: Colors,
    pub starting_position: Position,
    pub military: f32,
    pub production: f32,
    pub research: f32,
    pub resources: f32,
    pub owned_cells: i32,
    pub development:f32,
    pub milestones_reached: i32,
}

impl Player {
    pub fn spend_resources(&mut self, amount: f32) {
        self.resources -= amount;
    }
    pub fn gain_resources(&mut self, amount: f32) {
        self.resources += amount;
    }
    pub fn update_resources(&mut self) {

        let milestone =  MILESTONES.get(self.milestones_reached as usize).unwrap();

        let r = super::RESOURCES_AT_END_ROUND as f32;
        let p = self.production;
        let m = milestone.production_multiplier;
        let resource_gain = r * p * m;


        self.gain_resources(resource_gain);
    }
    pub fn update_development(&mut self) {
        let development_gain = super::DEVELOPMENT_AT_END_ROUND * self.research;
        self.development += development_gain;

        if self.development > super::MAX_DEVELOPMENT {
            self.development = super::MAX_DEVELOPMENT;
        }

        if self.development == super::MAX_DEVELOPMENT {

            self.milestones_reached += 1;
            self.development = 0.0;

            // cap milestones_reached at mat MILESTONES.len()
            if self.milestones_reached >= MILESTONES.len() as i32 {
                self.milestones_reached = MILESTONES.len() as i32 - 1;
            }

        }

    }
}

pub fn add_players_to_field(field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>) {
    for (_player_id, player) in players {
        field[player.borrow().starting_position.x as usize][player.borrow().starting_position.y as usize] = player.borrow().id;
    }
}


pub fn update_players(players: &mut HashMap<i32, RefCell<Player>>) {

    for (_player_id, player) in players {
        let mut player_ref = player.borrow_mut();
        player_ref.update_resources();
        player_ref.update_development();
        player_ref.owned_cells = 0;
    }

}

pub fn update_players_owned_cells(players: &mut HashMap<i32, RefCell<Player>>, field: &[[i32;super::BOARD_SIZE]; super::BOARD_SIZE]) {
    // loop through the new field and update the player's owned cells
    for x in 0..super::BOARD_SIZE {
        for y in 0..super::BOARD_SIZE {
            let cell_player_id = field[x][y];
            if cell_player_id != 0 {
                // let mut player = players.get(&cell_player_id).unwrap().borrow_mut();
                let mut player = players.get_mut(&cell_player_id).unwrap().borrow_mut();
                player.owned_cells += 1;
            }
        }
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
        resources: 0.0,
        owned_cells: 0,
        milestones_reached: 0,
        development: 0.0,
    };
    player
}