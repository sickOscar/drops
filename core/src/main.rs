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

enum Colors {
    Red,
    Blue,
    Yellow,
    Green,
}

const BOARD_SIZE: usize = 30;
const MAX_ITERATIONS: i32 = 200;
const SLEEP_TIME: u64 = 1000;
const STARTING_RESOURCES: i32 = (BOARD_SIZE * BOARD_SIZE) as i32;
const RESOURCES_TO_CONQUER_EMPTY_CELL: i32 = 1;
const RESOURCES_TO_CONQUER_FILLED_CELL: i32 = 10;
const SOCKET_TO_NODE: &str = "/tmp/drops_to_node.sock";
const SOCKET_FROM_NODE: &str = "/tmp/drops_from_node.sock";

struct Position {
    x: i32,
    y: i32,
}

struct Player {
    id: i32,
    // name: String,
    color: Colors,
    starting_position: Position,
    military: f32,
    production: f32,
    research: f32,
    resources: i32,
    owned_cells: i32,
}

impl Player {
    fn spend_resources(&mut self, amount: i32) {
        self.resources -= amount;
    }
}


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
    let mut players = create_players();
    add_players(&mut field, &mut players);

    let pm = Arc::new(Mutex::new(players));
    let fm = Arc::new(Mutex::new(field));

    let mut is_playing = true;
    let mut iterations = 0;

    let player_mutex = Arc::clone(&pm);

    let message_handling_thread = thread::spawn(move || {
        loop {
            let r = from_node_rx.recv().unwrap();
            // print!("FROM NODE {}", r);

            // MESSAGE FORMAT
            // playerId|(military,production,research)
            // change player values according to value passed in message

            let player_id = r.split("|").next().unwrap().parse::<i32>().unwrap();
            let mut player_values = String::from(r.split("|").skip(1).next().unwrap());

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
            let players = player_mutex.lock().unwrap();
            let mut p = players.get(&player_id).unwrap().borrow_mut();
            (*p).military = military;
            (*p).production = military;
            (*p).research = military;

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

    let game_run_thread = thread::spawn(move || {

        while is_playing {

            let sleep_time = time::Duration::from_millis(SLEEP_TIME);
            thread::sleep(sleep_time);

            let mut players = player_mutex.lock().unwrap();
            let mut field = field_mutex.lock().unwrap();

            iterations = iterations + 1;
            if iterations == MAX_ITERATIONS {
                is_playing = false;
            }

            let mut new_field = field.clone();

            // println!("Update board");
            update_board(&mut field, &mut players, &mut new_field);

            // update resources of each player
            for (_player_id, player) in &mut *players {
                let mut player_ref = player.borrow_mut();

                let resource_gain = RESOURCES_TO_CONQUER_FILLED_CELL as f32 * player_ref.production;
                player_ref.resources = player_ref.resources + resource_gain.floor() as i32;
            }

            *field = new_field.clone();

            render(&mut field, &players, &iterations);
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

fn add_players(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>) {
    for (_player_id, player) in players {
        field[player.borrow().starting_position.x as usize][player.borrow().starting_position.y as usize] = player.borrow().id;
    }
}

fn create_players() -> HashMap<i32, RefCell<Player>> {
    let player1 = Player {
        id: 1,
        // name: "John".to_string(),
        color: Colors::Red,
        starting_position: Position { x: 1, y: 1 },
        military: 0.5,
        production: 0.5,
        research: 0.0,
        resources: STARTING_RESOURCES,
        owned_cells: 1,
    };

    // let player2 = Player {
    //     id: 2,
    //     // name: "Jane".to_string(),
    //     color: Colors::Blue,
    //     starting_position: Position { x: BOARD_SIZE as i32 - 1, y: BOARD_SIZE as i32 - 1 },
    //     military: 0.6,
    //     production: 0.3,
    //     research: 0.1,
    //     resources: STARTING_RESOURCES,
    //     owned_cells: 1,
    // };
    //
    // let player3 = Player {
    //     id: 3,
    //     // name: "Jane".to_string(),
    //     color: Colors::Yellow,
    //     starting_position: Position { x: BOARD_SIZE as i32 / 2, y: BOARD_SIZE as i32 / 2 },
    //     military: 1.0,
    //     production: 0.0,
    //     research: 0.0,
    //     resources: STARTING_RESOURCES,
    //     owned_cells: 1,
    // };
    //
    // let player4 = Player {
    //     id: 4,
    //     // name: "Jane".to_string(),
    //     color: Colors::Green,
    //     starting_position: Position { x: 1, y: BOARD_SIZE as i32 - 1 },
    //     military: 0.0,
    //     production: 1.0,
    //     research: 0.0,
    //     resources: STARTING_RESOURCES,
    //     owned_cells: 1,
    // };

    let mut players: HashMap<i32, RefCell<Player>> = HashMap::new();
    players.insert(player1.id, RefCell::new(player1));
    // players.insert(player2.id, RefCell::new(player2));
    // players.insert(player3.id, RefCell::new(player3));
    // players.insert(player4.id, RefCell::new(player4));
    players
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
            let mut buffer = [0; 10000];
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

fn update_board(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>, new_field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE]) {

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


            // for every cell around the current cell
            for i in x_start..x_end + 1 {
                for j in y_start..y_end + 1 {
                    if has_conquered {
                        continue;
                    }

                    if field[i][j] != cell_player_id && new_field[i][j] != cell_player_id {
                        if field[i][j] == 0 {
                            let player = &mut players.get_mut(&cell_player_id).unwrap().borrow_mut();

                            if player.resources > 0 && new_field[i][j] == 0 {
                                player.spend_resources(RESOURCES_TO_CONQUER_EMPTY_CELL);
                                player.owned_cells = player.owned_cells + 1;

                                new_field[i][j] = cell_player_id;
                                has_conquered = true;
                            }
                        } else {
                            let current_player = &mut players.get(&cell_player_id).unwrap().borrow_mut();
                            let enemy_player = &mut players.get(&field[i][j]).unwrap().borrow_mut();

                            if has_conquered_cell(current_player, enemy_player, &(i as i32), &(j as i32)) {
                                if can_conquer_cell(current_player) {
                                    // println!("{} has conquered {}", current_player.id, enemy_player.id);

                                    current_player.spend_resources(RESOURCES_TO_CONQUER_FILLED_CELL);

                                    current_player.owned_cells = current_player.owned_cells + 1;
                                    enemy_player.owned_cells = enemy_player.owned_cells - 1;

                                    new_field[i][j] = cell_player_id;
                                    has_conquered = true;
                                }
                            } else {
                                new_field[i][j] = field[i][j];
                            }
                        }
                    }
                }
            }
        }
    }
}

fn can_conquer_cell(current_player: &mut RefMut<Player>) -> bool {
    current_player.resources > 0 && current_player.resources - RESOURCES_TO_CONQUER_FILLED_CELL > 0
}

fn has_conquered_cell(current_player: &mut RefMut<Player>, enemy_player: &mut RefMut<Player>, i: &i32, j: &i32) -> bool {

    // if it's the starting cell, cannot conquer
    if i == &enemy_player.starting_position.x && j == &enemy_player.starting_position.y {
        return false;
    }

    current_player.military > enemy_player.military
}


fn render(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &HashMap<i32, RefCell<Player>>, iterations: &i32) {
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
