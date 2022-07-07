use std::collections::HashMap;
use std::{thread, time};
use std::cell::{RefCell, RefMut};
use colored::Colorize;
use std::os::unix::net::{UnixStream, UnixListener};
use std::io::prelude::*;
use std::fs::*;
use std::sync::mpsc::{channel, Receiver, Sender};
use std::sync::{Arc, Mutex};
use std::thread::JoinHandle;
use rand::prelude::SliceRandom;
use rand::thread_rng;

// CUSTOM MODULES DEFINITION
mod utils;
mod player;

use player::{Player, create_player, create_players_hashmap};
use utils::{Colors, Position};

pub const MAX_PLAYERS: i8 = 8;
pub const BOARD_SIZE: usize = 20;
pub const MAX_ITERATIONS: i32 = 5;
pub const SLEEP_TIME: u64 = 1000;
pub const STARTING_RESOURCES: i32 = (BOARD_SIZE * BOARD_SIZE) as i32;
pub const RESOURCES_TO_CONQUER_EMPTY_CELL: i32 = 1;
pub const RESOURCES_TO_CONQUER_FILLED_CELL: i32 = 10;
pub const SOCKET_TO_NODE: &str = "/tmp/drops_to_node.sock";
pub const SOCKET_FROM_NODE: &str = "/tmp/drops_from_node.sock";




fn main() {

    // START THREAD CHANNELS
    let (to_node_tx, sender_rx) = channel();
    let (receiver_tx, from_node_rx) = channel();

    // START IPC SOCKETS
    start_ipc_sender(sender_rx);
    start_ipc_receiver(receiver_tx);

    start_game_thread(from_node_rx, to_node_tx);

}

fn start_game_thread(from_node_rx: Receiver<String>, to_node_tx: Sender<String>)  {

    let mut field: [[i32; BOARD_SIZE]; BOARD_SIZE] = [[0; BOARD_SIZE]; BOARD_SIZE];
    let mut players = create_players_hashmap();
    let is_playing = false;

    let pm = Arc::new(Mutex::new(players));
    let fm = Arc::new(Mutex::new(field));
    let playing_m = Arc::new(Mutex::new(is_playing));

    let mut iterations = 0;

    let player_mutex = Arc::clone(&pm);
    let playing_mutex = Arc::clone(&playing_m);
    let field_mutex = Arc::clone(&fm);

    let message_handling_thread = thread::spawn(move || {
        loop {
            let r = from_node_rx.recv().unwrap();

            println!("GOT DATA {}", r);

            if r.starts_with("play") {

                // PLAY MESSAGE FORMAT
                // play:<player1_id>|<player2_id>|<player3_id>|...|<playerN_id>

                let players_string = r.chars().skip(5).collect::<String>();
                println!("players_string {}", players_string);
                let players_ids:Vec<&str> = players_string.split("|").collect();
                println!("players_ids {:?}", players_ids);

                println!("waiting for players mutex on data");
                let mut players = player_mutex.lock().unwrap();

                for player_id in players_ids {
                    let new_player = create_player(player_id.parse::<i32>().unwrap());
                    players.insert(new_player.id, RefCell::new(new_player));
                }

                println!("waiting for field mutex");
                let mut field = field_mutex.lock().unwrap();
                add_players_to_field(&mut field, &mut players);

                println!("waiting for is_playing mutex on data");
                let mut is_playing = playing_mutex.lock().unwrap();
                *is_playing = true;


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
                // let production = player_values_to_vec[1].parse::<f32>().unwrap();
                // let research = player_values_to_vec[2].parse::<f32>().unwrap();

                // println!("{}, {}, {}", military, production, research);

                // set player values
                // println!("Locking players on message_handling_thread");

                println!("waiting for players mutex");
                let players = player_mutex.lock().unwrap();
                let mut p = players.get(&player_id).unwrap().borrow_mut();
                (*p).military = military;
                (*p).production = military;
                (*p).research = military;

            }



        }
    });

    let field_mutex = Arc::clone(&fm);

    let message_sending_thread = thread::spawn(move || {
        loop {
            let ten_millis = time::Duration::from_millis(1000);
            thread::sleep(ten_millis);
            let field = field_mutex.lock().unwrap();
            // println!("Sending board");
            to_node_tx.send(format!("*{:?}\n", field)).unwrap();
        }
    });

    let player_mutex = Arc::clone(&pm);
    let field_mutex = Arc::clone(&fm);
    let playing_mutex = Arc::clone(&playing_m);

    let game_run_thread = thread::spawn(move || {

        let mut first_print = true;

        loop {

            if first_print {
                println!("{}", "Waiting for players...".green());
                first_print = false;
            }

            println!("waiting for is_playing mutex on game thread");
            let mut is_playing = playing_mutex.lock().unwrap();
            println!("waiting for players mutex on game");
            let mut players = player_mutex.lock().unwrap();
            println!("waiting for field mutex on game");
            let mut field = field_mutex.lock().unwrap();

            while *is_playing {

                println!("{}", "Game start!".yellow());

                let sleep_time = time::Duration::from_millis(SLEEP_TIME);
                thread::sleep(sleep_time);

                iterations = iterations + 1;
                if iterations == MAX_ITERATIONS {
                    *is_playing = false;
                    first_print = true;
                }

                let mut new_field = field.clone();

                // println!("Update board");
                update_board(&mut field, &mut players, &mut new_field);

                // update resources of each player
                for (_player_id, player) in &mut *players {
                    let mut player_ref = player.borrow_mut();

                    let resource_gain = RESOURCES_TO_CONQUER_FILLED_CELL as f32 * player_ref.production;
                    player_ref.gain_resources(resource_gain.floor() as i32);
                }

                *field = new_field.clone();

                println!("iteration {}", iterations)

                // render(&mut field, &players, &iterations);

            }

            *field = [[0; BOARD_SIZE]; BOARD_SIZE];
            *players = create_players_hashmap();
            iterations = 0;

        }


    });

    game_run_thread.join().unwrap();
    match message_handling_thread.join() {
        Ok(_) => println!("Message handling thread joined"),
        Err(str) => {
            println!("{:?}", str);
            panic!("Message handling thread failed to join");
        }
    }
    message_sending_thread.join().unwrap();
}

fn add_players_to_field(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>) {
    for (_player_id, player) in players {
        field[player.borrow().starting_position.x as usize][player.borrow().starting_position.y as usize] = player.borrow().id;
    }
}



fn start_ipc_receiver(tx: Sender<String>) -> JoinHandle<()> {
    return thread::spawn(move || {
        let mut stream = match UnixStream::connect(SOCKET_FROM_NODE) {
            Ok(stream) => {
                println!("Connected to node");
                stream
            }
            Err(err) => {
                panic!("{}", err);
            }
        };

        loop {
            let mut buffer = [0; 1000];
            match stream.read(&mut buffer) {
                Ok(size) => {
                    let received = String::from_utf8_lossy(&buffer[0..size]);
                    if size > 0 {
                        tx.send(received.to_string()).unwrap();
                    }

                }
                Err(err) => {
                    println!("{}", err);
                }
            }

        }
    });
}

fn start_ipc_sender(rx: Receiver<String>) -> JoinHandle<()> {
    return thread::spawn(move || {
        match remove_file(SOCKET_TO_NODE) {
            Ok(_) => println!("Removed {}", SOCKET_TO_NODE),
            Err(_) => (),
        }
        let socket = match UnixListener::bind(SOCKET_TO_NODE) {
            Ok(listener) => listener,
            Err(err) => {
                panic!("{}", err);
            }
        };

        match socket.accept() {
            Ok((mut socket, _addr)) => {
                println!("Got a listenting client");

                loop {
                    let received = match rx.recv() {
                        Ok(received) => received,
                        Err(err) => {
                            panic!("{}", err);
                        }
                    };

                    let to_send = format!("{}", received);

                    match socket.write_all(to_send.as_bytes()) {
                        Ok(_) => (),
                        Err(err) => println!("{}", err),
                    }
                    socket.flush().unwrap();
                }
            }
            Err(_e) => {
                println!("Connection lost")
            }
        }
    });
}

fn update_board(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &mut HashMap<i32, RefCell<player::Player>>, new_field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE]) {

    // println!("mil player 1: {:?}", players.get(&1).unwrap().borrow().military);

    for x in 0..BOARD_SIZE {
        for y in 0..BOARD_SIZE {

            if field[x][y] == 0 {
                continue;
            }

            let mut has_conquered = false;
            let cell_player_id = field[x][y];

            let x_start = if x > 0 { x - 1 } else { x };
            let x_end = if x < BOARD_SIZE - 1 { x + 1 } else { x };
            let y_start = if y > 0 { y - 1 } else { y };
            let y_end = if y < BOARD_SIZE - 1 { y + 1 } else { y };

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
                        player.spend_resources(RESOURCES_TO_CONQUER_EMPTY_CELL);
                        player.owned_cells = player.owned_cells + 1;

                        new_field[x_neighbor as usize][y_neighbor as usize] = cell_player_id;
                        has_conquered = true;
                    }
                } else {

                    let mut current_player = &mut players.get(&cell_player_id).unwrap().borrow_mut();
                    let mut enemy_player = &mut players.get(&neighbor_value).unwrap().borrow_mut();

                    if has_conquered_cell(&mut current_player, &mut enemy_player, &x_neighbor, &y_neighbor) {
                        if can_conquer_cell(current_player) {

                            current_player.spend_resources(RESOURCES_TO_CONQUER_FILLED_CELL);

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
}

fn can_conquer_cell(current_player: &mut RefMut<player::Player>) -> bool {
    current_player.resources > 0 && current_player.resources - RESOURCES_TO_CONQUER_FILLED_CELL > 0
}

fn has_conquered_cell(current_player: &mut RefMut<player::Player>, enemy_player: &mut RefMut<player::Player>, i: &i32, j: &i32) -> bool {

    // if it's the starting cell, cannot conquer
    if i == &enemy_player.starting_position.x && j == &enemy_player.starting_position.y {
        return false;
    }

    current_player.military > enemy_player.military
}


fn render(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &HashMap<i32, RefCell<player::Player>>, iterations: &i32) {
    print!("\x1B[2J\x1B[1;1H");
    println!("-----------------------------------------------------");
    for x in 0..BOARD_SIZE {
        for y in 0..BOARD_SIZE {
            if field[x][y] == 0 {
                print!(" - ");
            } else {
                let player = &*players.get(&field[x][y]).unwrap().borrow();

                match player.color {
                    Colors::Red => print!(" {} ", player.id.to_string().red()),
                    Colors::Blue => print!(" {} ", player.id.to_string().blue()),
                    Colors::Yellow => print!(" {} ", player.id.to_string().yellow()),
                    Colors::Green => print!(" {} ", player.id.to_string().green()),
                }

                // print!(" \x1b[93m{}\x1b[0m ", player.id);
            }
            // print!("{}  ", field[x][y]);
        }
        print!("\n");
    }
    println!("-----------------------------------------------------\n");
    println!("Iteration: {}", iterations);
    for (player_id, player) in players {
        println!("Player {}: res {} | cells {}", player_id, player.borrow().resources, player.borrow().owned_cells);
    }
    print!("-----------------------------------------------------\n");
}
