use std::sync::mpsc;
use std::{thread, time};

#[derive(Debug)]
struct Per {
    x: i32
}

fn main() {

    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        
        loop {

            let per = Per {x:34};

            tx.send(per).unwrap();
            
            thread::sleep(time::Duration::from_millis(300));
        }
    });

    let game_thread = thread::spawn(move || {

        loop {
            let message = rx.recv().unwrap();
            println!("{:?}", message);
        }
    });

    game_thread.join().unwrap();
}
