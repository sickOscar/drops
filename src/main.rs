use std::collections::HashMap;
use std::{thread, time};
use std::cell::{RefCell, RefMut};
use colored::Colorize;
use rand::prelude::*;

enum Colors {
    Red,
    Blue,
    Yellow,
    Green
}

const BOARD_SIZE:usize = 20;
const MAX_ITERATIONS:i32 = 200;
const SLEEP_TIME:u64 = 1000;
const STARTING_RESOURCES:i32 = 100;
const RESOURCES_TO_CONQUER_EMPTY_CELL:i32 = 1;
const RESOURCES_TO_CONQUER_FILLED_CELL:i32 = 10;

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
    resources: i32,
    owned_cells: i32
}

impl Player {
    fn spend_resources(&mut self, amount: i32) {
        self.resources -= amount;
    }
}

fn main() {
    let mut rng = thread_rng();
    let mut field:[[i32; BOARD_SIZE]; BOARD_SIZE] = [[0; BOARD_SIZE]; BOARD_SIZE];

    let player1 = Player {
        id: 1,
        // name: "John".to_string(),
        color: Colors::Red,
        starting_position: Position { x: 1, y: 1 },
        military: 0.5,
        production: 0.5,
        resources: STARTING_RESOURCES,
        owned_cells: 1
    };

    let player2 = Player {
        id: 2,
        // name: "Jane".to_string(),
        color: Colors::Blue,
        starting_position: Position { x: 9, y: 9 },
        military: 0.6,
        production: 0.4,
        resources: STARTING_RESOURCES,
        owned_cells: 1
    };

    let player3 = Player {
        id: 3,
        // name: "Jane".to_string(),
        color: Colors::Yellow,
        starting_position: Position { x: 5, y: 18 },
        military: 1.0,
        production: 0.0,
        resources: STARTING_RESOURCES,
        owned_cells: 1
    };

    let player4 = Player {
        id: 4,
        // name: "Jane".to_string(),
        color: Colors::Green,
        starting_position: Position { x: 19, y: 19 },
        military: 0.0,
        production: 1.0,
        resources: STARTING_RESOURCES,
        owned_cells: 1
    };

    let mut players:HashMap<i32, RefCell<Player>> = HashMap::new();
    players.insert(player1.id, RefCell::new(player1));
    players.insert(player2.id, RefCell::new(player2));
    players.insert(player3.id, RefCell::new(player3));
    players.insert(player4.id, RefCell::new(player4));

    for (player_id, player) in &players {
        field[player.borrow().starting_position.x as usize][player.borrow().starting_position.y as usize] = player.borrow().id;
    }

    let mut is_playing = true;
    let mut counter = 0;

    render(&mut field, &players);

    while is_playing {


        let ten_millis = time::Duration::from_millis(SLEEP_TIME);
        thread::sleep(ten_millis);

        counter = counter + 1;
        if counter == MAX_ITERATIONS {
            is_playing = false;
        }

        let mut new_field = field.clone();

        update_board(&mut field, &mut players, &mut new_field);

        // update resources of each player
        for (player_id, player) in &mut players {
            let mut player_ref = player.borrow_mut();

            let resource_gain = RESOURCES_TO_CONQUER_FILLED_CELL as f32 * player_ref.production;
            player_ref.resources = player_ref.resources + resource_gain.floor() as i32;
        }

        field = new_field.clone();

        render(&mut field, &players);

    }



}

fn update_board(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &mut HashMap<i32, RefCell<Player>>, new_field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE]) {
    for x in 0..BOARD_SIZE {
        for y in 0..BOARD_SIZE {
            if field[x][y] == 0 {
                continue
            }

            let mut has_conquered = false;
            let cell_player_id = field[x][y];

            let x_start = if x > 0 { x - 1 } else { x };
            let x_end = if x < BOARD_SIZE - 1 { x + 1 } else { x };
            let y_start = if y > 0 { y - 1 } else { y };
            let y_end = if y < BOARD_SIZE - 1 { y + 1 } else { y };

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

fn has_conquered_cell(current_player: &mut RefMut<Player>, enemy_player: &mut RefMut<Player>, i:&i32, j:&i32) -> bool {

    // if it's the starting cell, cannot conquer
    if i == &enemy_player.starting_position.x && j == &enemy_player.starting_position.y {
        return false;
    }

    current_player.military  > enemy_player.military
}


fn render(field: &mut [[i32; BOARD_SIZE]; BOARD_SIZE], players: &HashMap<i32, RefCell<Player>>) {
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
    for (player_id, player) in players {
        println!("Player {}: res {} | cells {}", player_id, player.borrow().resources, player.borrow().owned_cells);
    }
    print!("-----------------------------------------------------\n");


}
