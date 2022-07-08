use std::collections::HashMap;
use std::cell::{RefCell, RefMut};
use rand::prelude::SliceRandom;
use rand::thread_rng;

use super::player::{Player};

pub fn update_board(field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>> ) -> [[i32; super::BOARD_SIZE]; super::BOARD_SIZE] {

    // println!("mil player 1: {:?}", players.get(&1).unwrap().borrow().military);

    let mut new_field:[[i32; super::BOARD_SIZE]; super::BOARD_SIZE] = field.clone();

    for x in 0..super::BOARD_SIZE {
        for y in 0..super::BOARD_SIZE {
            if field[x][y] == 0 {
                continue;
            }

            let mut has_conquered = false;
            let cell_player_id = field[x][y];

            let x_start = if x > 0 { x - 1 } else { x };
            let x_end = if x < super::BOARD_SIZE - 1 { x + 1 } else { x };
            let y_start = if y > 0 { y - 1 } else { y };
            let y_end = if y < super::BOARD_SIZE - 1 { y + 1 } else { y };

            // make a list of tuples with the coordinates of the neighbors
            let mut neighbors: Vec<(i32, i32)> = Vec::new();
            for x_neighbor in x_start..=x_end {
                for y_neighbor in y_start..=y_end {

                    // exclude the current cell
                    if x_neighbor == x && y_neighbor == y {
                        continue;
                    }

                    // exclude cells that are owned by the player both on field and new_field
                    if field[x_neighbor][y_neighbor] == cell_player_id {
                        continue;
                    }

                    neighbors.push((x_neighbor as i32, y_neighbor as i32));
                }
            }

            // shuffle the list of neighbors
            neighbors.shuffle(&mut thread_rng());

            for (x_neighbor, y_neighbor) in neighbors {
                if has_conquered {
                    continue;
                }

                let neighbor_value = field[x_neighbor as usize][y_neighbor as usize];
                let neighbor_value_on_new_field = new_field[x_neighbor as usize][y_neighbor as usize];

                if neighbor_value == 0 {
                    let player = &mut players.get_mut(&cell_player_id).unwrap().borrow_mut();

                    if player.resources > 0 && neighbor_value_on_new_field == 0 {
                        player.spend_resources(super::RESOURCES_TO_CONQUER_EMPTY_CELL);
                        player.owned_cells = player.owned_cells + 1;

                        new_field[x_neighbor as usize][y_neighbor as usize] = cell_player_id;
                        has_conquered = true;
                    }
                } else {
                    let mut current_player = &mut players.get(&cell_player_id).unwrap().borrow_mut();
                    let mut enemy_player = &mut players.get(&neighbor_value).unwrap().borrow_mut();

                    if has_conquered_cell(&mut current_player, &mut enemy_player, &x_neighbor, &y_neighbor) {
                        if can_conquer_cell(current_player) {
                            current_player.spend_resources(super::RESOURCES_TO_CONQUER_FILLED_CELL);

                            current_player.owned_cells = current_player.owned_cells + 1;
                            enemy_player.owned_cells = enemy_player.owned_cells - 1;

                            new_field[x_neighbor as usize][y_neighbor as usize] = cell_player_id;
                            has_conquered = true;
                        }
                    } else {
                        new_field[x_neighbor as usize][y_neighbor as usize] = neighbor_value;
                    }
                }
            }
        }
    }

    new_field
}


fn can_conquer_cell(current_player: &mut RefMut<Player>) -> bool {
    current_player.resources > 0 && current_player.resources - super::RESOURCES_TO_CONQUER_FILLED_CELL > 0
}

fn has_conquered_cell(current_player: &mut RefMut<Player>, enemy_player: &mut RefMut<Player>, i: &i32, j: &i32) -> bool {
    // if it's the starting cell, cannot conquer
    if i == &enemy_player.starting_position.x && j == &enemy_player.starting_position.y {
        return false;
    }
    current_player.military > enemy_player.military
}