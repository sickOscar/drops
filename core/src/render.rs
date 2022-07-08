use std::cell::{RefCell};
use std::collections::HashMap;

use colored::Colorize;

use super::player::Player;
use super::utils::Colors;

pub fn render(field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &HashMap<i32, RefCell<Player>>, iterations: &i32) {
    print!("\x1B[2J\x1B[1;1H");
    println!("iteration {}", iterations);
    println!("-----------------------------------------------------");
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
    println!("-----------------------------------------------------");
    println!("Iteration: {}", iterations);
    println!("name\tres\tcells\tmil\tprod\tresearch");
    for (player_id, player) in players {
        let p = player.borrow();
        println!("Pl {}\t{}\t{}\t{}\t{}\t{}", player_id, p.resources, p.owned_cells, p.military, p.production, p.research);
    }
    print!("-----------------------------------------------------\n");
}
