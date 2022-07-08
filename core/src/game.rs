use std::{thread, time};
use colored::Colorize;
use std::sync::mpsc::{Receiver, Sender};
use std::sync::{Arc, Mutex};

use super::player::{create_players_hashmap, update_players_resources};
use super::board::{update_board};
use super::render::{render};
use super::input::{handle_game_input, handle_initial_commands};

pub fn game_loop(from_node_rx: Receiver<String>, to_node_tx: Sender<String>) {
    let mut field: [[i32; super::BOARD_SIZE]; super::BOARD_SIZE] = [[0; super::BOARD_SIZE]; super::BOARD_SIZE];
    let mut players = create_players_hashmap();
    let mut is_playing = false;

    let fm = Arc::new(Mutex::new(field));

    let mut iterations = 0;

    let field_mutex = Arc::clone(&fm);

    thread::spawn(move || {
        loop {
            let ten_millis = time::Duration::from_millis(1000);
            thread::sleep(ten_millis);
            let field = field_mutex.lock().unwrap();
            // println!("Sending board");
            to_node_tx.send(format!("*{:?}\n", field)).unwrap();
        }
    });

    let mut first_print = true;

    loop {
        if first_print {
            println!("{}", "Waiting for players...".green());
            first_print = false;
        }

        // println!("{}", "Waiting for message from node...".cyan());
        handle_initial_commands(&from_node_rx, &mut field, &mut players, &mut is_playing);

        while is_playing {
            let sleep_time = time::Duration::from_millis(super::TIME_BETWEEN_ITERATIONS);
            thread::sleep(sleep_time);

            handle_game_input(&from_node_rx, &mut players);

            match is_game_running(&iterations) {
                true => {
                    iterations += 1;
                }
                false => {
                    players = create_players_hashmap();
                    field = [[0; super::BOARD_SIZE]; super::BOARD_SIZE];
                    first_print = true;
                    is_playing = false;
                    break;
                }
            };

            let new_field = update_board(&mut field, &mut players);

            // update resources of each player
            update_players_resources(&mut players);

            // set field to new field
            field = new_field.clone();

            println!("iteration {}", iterations);

            render(&mut field, &players, &iterations);
        }


        iterations = 0;
    }
}


fn is_game_running(iterations: &i32) -> bool {
    *iterations < super::MAX_ITERATIONS
}