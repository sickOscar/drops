use std::time::Duration;
use std::cell::RefCell;
use std::collections::HashMap;
use colored::Colorize;
use std::sync::mpsc::{Receiver, Sender};
use std::thread::sleep;

use crate::player::{Player, create_players_hashmap, update_players};
use crate::board::{update_board};
use crate::render::{render};
use crate::input::{handle_game_input, handle_initial_commands};

pub fn game_loop(from_node_rx: Receiver<String>, to_node_tx: Sender<String>) {

    let mut field: [[i32; super::BOARD_SIZE]; super::BOARD_SIZE] = [[0; super::BOARD_SIZE]; super::BOARD_SIZE];
    let mut players = create_players_hashmap();
    let mut is_playing = false;

    let mut iterations = 0;
    let mut waiting_for_players = true;

    loop {
        if waiting_for_players {
            println!("{}", "Waiting for players...".green());
            waiting_for_players = false;
        }

        handle_initial_commands(&from_node_rx, &mut field, &mut players, &mut is_playing);

        sleep(Duration::from_millis(100));

        while is_playing {

            sleep(Duration::from_millis(super::TIME_BETWEEN_ITERATIONS));

            handle_game_input(&from_node_rx, &mut players);

            match is_game_running(&iterations) {
                true => {
                    iterations += 1;
                }
                false => {

                    // send endgame message to node
                    send_endgame_to_node(&to_node_tx);

                    // reset game
                    reset_game(&mut field, &mut players, &mut is_playing, &mut waiting_for_players);
                    break;
                }
            };

            let new_field = update_board(&mut field, &mut players);

            // update resources of each player
            update_players(&mut players);

            // set field to new field
            field = new_field.clone();


            render(&mut field, &players, &iterations);

            send_status_to_node(&to_node_tx, field, &players);
        }


        iterations = 0;
    }
}

fn reset_game(field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>, is_playing: &mut bool, waiting_for_players: &mut bool) {
    *players = create_players_hashmap();
    *field = [[0; super::BOARD_SIZE]; super::BOARD_SIZE];
    *waiting_for_players = true;
    *is_playing = false;
}

fn send_endgame_to_node(to_node_tx: &Sender<String>) {
    let message = String::from("*endgame|\n");
    to_node_tx.send(message).unwrap();
}

fn send_status_to_node(to_node_tx: &Sender<String>, field: [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], players: &HashMap<i32, RefCell<Player>>) {
    to_node_tx.send(format!("*field:{:?}|\n", field)).unwrap();

    let mut players_status = String::from("*players:");
    let mut p_array: Vec<String> = Vec::new();
    for (_, player) in players.iter() {
        let player_json = serde_json::to_string(&player).unwrap();
        p_array.push(player_json);
        // players_status.push_str(player_json.as_str());
    }
    players_status.push_str(p_array.join("/").as_str());
    players_status.push_str("|\n");

    to_node_tx.send(players_status).unwrap();
}


fn is_game_running(iterations: &i32) -> bool {
    *iterations < super::MAX_ITERATIONS
}