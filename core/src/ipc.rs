use std::{thread};
use colored::Colorize;
use std::os::unix::net::{UnixListener, UnixStream};
use std::io::prelude::*;
use std::fs::*;
use std::sync::mpsc::{Receiver, Sender, TryRecvError};
use std::thread::{JoinHandle, sleep};
use std::time::Duration;

pub fn start_ipc_receiver(tx: Sender<String>) -> JoinHandle<()> {
    return thread::spawn(move || loop {
        println!("{}", "Connecting to node...".yellow());
        let mut stream = match UnixStream::connect(super::SOCKET_FROM_NODE) {
            Ok(stream) => {
                println!("{}", "Connecting to node DONE\n".yellow());
                stream
            }
            Err(err) => {
                println!("{}", "Connecting to node FAILED\n".yellow());
                println!("{}", err.to_string().red());
                thread::sleep(Duration::from_secs(3));
                continue;
            }
        };

        let mut connected = true;

        while connected {
            sleep(Duration::from_millis(100));
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
                    connected = false;
                }
            }
        }
    });
}

pub fn start_ipc_sender(rx: Receiver<String>) -> JoinHandle<()> {
    return thread::spawn(move || loop {
        println!("{}", "Serving IPC socket...".yellow());

        match remove_file(super::SOCKET_TO_NODE) {
            Ok(_) => {
                println!("{}", "Removing old socket...".yellow());
            }
            Err(_) => {
                println!("{}", "No old socket to remove...".yellow());
            }
        }

        let socket = match UnixListener::bind(super::SOCKET_TO_NODE) {
            Ok(listener) => {
                println!("{}", "Serving IPC socket DONE\n".yellow());
                listener
            }
            Err(err) => {
                panic!("{}", err);
            }
        };

        match socket.accept() {
            Ok((mut socket, _add)) => {

                println!("Got a listenting client");

                loop {
                    sleep(Duration::from_millis(100));
                    let received = match rx.try_recv() {
                        Ok(received) => received,
                        Err(e) => {
                            match e {
                                TryRecvError::Empty => {
                                    // println!( "Sleeping");
                                    // thread::sleep(time::Duration::from_millis(SLEEP_TIME));
                                    continue;
                                }
                                TryRecvError::Disconnected => {
                                    // println!("Disconnected from node");
                                    return;
                                }
                            }
                        }
                    };

                    let to_send = format!("{}", received);

                    match socket.write_all(to_send.as_bytes()) {
                        Ok(_) => (),
                        Err(err) => println!("{}", err),
                    }
                    // socket.flush().unwrap();
                }
            }
            Err(_e) => {
                println!("Connection lost")
            }
        }
    });
}
