use std::sync::mpsc::{channel};

// CUSTOM MODULES DEFINITION
mod utils;
mod player;
mod board;
mod render;
mod input;
mod ipc;
mod game;

use ipc::{start_ipc_sender, start_ipc_receiver};
use game::{game_loop};

pub const MAX_PLAYERS: i8 = 8;
pub const BOARD_SIZE: usize = 30;
pub const MAX_ITERATIONS: i32 = 500;
pub const TIME_BETWEEN_ITERATIONS: u64 = 500;
pub const STARTING_RESOURCES: i32 = (BOARD_SIZE * BOARD_SIZE) as i32;
pub const RESOURCES_TO_CONQUER_EMPTY_CELL: i32 = 1;
pub const RESOURCES_TO_CONQUER_FILLED_CELL: i32 = 10;
const RESOURCES_AT_END_ROUND:i32 = 10;
const STARTING_POSITIONS:[(usize, usize); crate::MAX_PLAYERS as usize] = [
    (1, 1),
    (crate::BOARD_SIZE / 2, 1),
    (crate::BOARD_SIZE - 2, 1),
    (crate::BOARD_SIZE - 2, crate::BOARD_SIZE / 2),
    (crate::BOARD_SIZE - 2, crate::BOARD_SIZE - 2),
    (crate::BOARD_SIZE / 2, crate::BOARD_SIZE - 2),
    (1, crate::BOARD_SIZE - 2),
    (1, crate::BOARD_SIZE / 2),
];
pub const SOCKET_TO_NODE: &str = "/tmp/drops_to_node.sock";
pub const SOCKET_FROM_NODE: &str = "/tmp/drops_from_node.sock";


fn main() {

    // START THREAD CHANNELS
    let (to_node_tx, sender_rx) = channel();
    let (receiver_tx, from_node_rx) = channel();

    // START IPC SOCKETS
    start_ipc_sender(sender_rx);
    start_ipc_receiver(receiver_tx);

    game_loop(from_node_rx, to_node_tx);
}








