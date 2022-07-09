use std::cell::{RefCell};
use std::collections::HashMap;
use std::sync::mpsc::{Receiver, TryRecvError};

use super::player::{add_players_to_field, create_player, Player};

pub fn handle_game_input(from_node_rx: &Receiver<String>, players: &mut HashMap<i32, RefCell<Player>>) {
    let r = recieve_data_from_node(&from_node_rx);
    if r.is_empty() {
        return;
    } else if r.starts_with("|") {


        // MESSAGE FORMAT FOR PLAYER ACTION
        // |playerId|(military,production,research)
        // change player values according to value passed in message

        let player_id = r.split("|")
            .skip(1)
            .next().unwrap()
            .parse::<i32>().unwrap();
        let mut player_values = String::from(
            r.split("|")
                .skip(2)
                .next().unwrap()
        );

        // remove trailing )/n
        player_values.pop().unwrap();
        player_values.pop().unwrap();
        // remove initial (
        player_values.remove(0);

        let player_values_to_vec = player_values.split(",").collect::<Vec<&str>>();
        // println!("{:?}", player_values_to_vec);
        let military = player_values_to_vec[0].parse::<f32>().unwrap();
        let production = player_values_to_vec[1].parse::<f32>().unwrap();
        let research = player_values_to_vec[2].parse::<f32>().unwrap();

        // println!("{}, {}, {}", military, production, research);

        // set player values
        // println!("Locking players on message_handling_thread");

        let mut p = players.get(&player_id).unwrap().borrow_mut();
        (*p).military = military;
        (*p).production = production;
        (*p).research = research;

        println!("Updated player {}: {}, {}, {}", player_id, military, production, research);
    }
}

pub fn handle_initial_commands(from_node_rx: &Receiver<String>, mut field: &mut [[i32; super::BOARD_SIZE]; super::BOARD_SIZE], mut players: &mut HashMap<i32, RefCell<Player>>, is_playing: &mut bool) {
    let r = recieve_data_from_node(&from_node_rx);
    if r.is_empty() {
        return;
    }
    if r.starts_with("play") {

        // PLAY MESSAGE FORMAT
        // play:<player1_id>|<player2_id>|<player3_id>|...|<playerN_id>

        let players_string = r.chars().skip(5).collect::<String>();
        println!("players_string {}", players_string);
        let players_ids: Vec<&str> = players_string.split("|").collect();
        println!("players_ids {:?}", players_ids);

        for player_id in players_ids {
            let new_player = create_player(player_id.parse::<i32>().unwrap());
            players.insert(new_player.id, RefCell::new(new_player));
        }

        add_players_to_field(&mut field, &mut players);

        *is_playing = true;
    } else if r.starts_with("quit") {
        *is_playing = false;
    }
}



fn recieve_data_from_node(from_node_rx: &Receiver<String>) -> String {
    let r = match from_node_rx.try_recv() {
        Ok(r) => r,
        Err(e) => {
            match e {
                TryRecvError::Empty => {
                    // thread::sleep(time::Duration::from_millis(SLEEP_TIME));
                    String::from("")
                }
                TryRecvError::Disconnected => {
                    // println!("Disconnected from node");
                    String::from("")
                }
            }
        }
    };
    r
}