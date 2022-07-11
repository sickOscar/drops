use std::cell::{RefCell};
use std::collections::HashMap;

use colored::Colorize;

use super::player::Player;
use super::utils::Colors;

pub fn render(_field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &HashMap<i32, RefCell<Player>>, iterations: &i32) {

    clear_screen();

    println!("-----------------------------------------------------");

    // draw_board(&field, players);

    println!("-----------------------------------------------------");

    draw_table(players, iterations);

    println!("-----------------------------------------------------");
}

fn draw_table(players: &HashMap<i32, RefCell<Player>>, iterations: &i32) {
    println!("Iteration: {}", iterations);
    println!(
        "{0: <10} | {1: <10} | {2: <10} | {3: <10} | {4: <10} | {5: <10} | {6: <10} | {7: <10}",
        " ", "res", "cells", "military", "prod", "research", "dev", "milestone"
    );
    for (player_id, player) in players {
        let p = player.borrow();

        println!(
            "{0: <10} | {1: <10} | {2: <10} | {3: <10} | {4: <10} | {5: <10} | {6: <10} | {7: <10}",
            player_id, p.resources, p.owned_cells, p.military, p.production, p.research, p.development, p.milestones_reached
        );

    }
}

fn clear_screen() {
    print!("\x1B[2J\x1B[1;1H");
}

fn _draw_board(field: &&mut [[i32; 40]; 40], players: &HashMap<i32, RefCell<Player>>) {
    for x in 0..super::BOARD_SIZE {
        for y in 0..super::BOARD_SIZE {
            if field[x][y] == 0 {
                print!(" - ");
            } else {
                let player = &*players.get(&field[x][y]).unwrap().borrow();

                match player.color {
                    Colors::Red => print!(" {} ", player.id.to_string().red()),
                    Colors::Blue => print!(" {} ", player.id.to_string().blue()),
                    Colors::Yellow => print!(" {} ", player.id.to_string().yellow()),
                    // Colors::Green => print!(" {} ", player.id.to_string().green()),
                }

                // print!(" \x1b[93m{}\x1b[0m ", player.id);
            }
            // print!("{}  ", field[x][y]);
        }
        print!("\n");
    }
}
