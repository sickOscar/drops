
pub struct Milestone {
    pub military_multiplier: f32,
    pub production_multiplier: f32,
    pub conquer_cost_multiplier: f32,
}

pub const MILESTONES:[Milestone; 10] = [
    Milestone {
        military_multiplier: 1.0,
        production_multiplier: 1.0,
        conquer_cost_multiplier: 1.0,
    },
    Milestone {
        military_multiplier: 1.1,
        production_multiplier: 1.1,
        conquer_cost_multiplier: 0.9,
    },
    Milestone {
        military_multiplier: 1.2,
        production_multiplier: 1.2,
        conquer_cost_multiplier: 0.8,
    },
    Milestone {
        military_multiplier: 1.3,
        production_multiplier: 1.3,
        conquer_cost_multiplier: 0.7,
    },
    Milestone {
        military_multiplier: 1.4,
        production_multiplier: 1.4,
        conquer_cost_multiplier: 0.6,
    },
    Milestone {
        military_multiplier: 1.5,
        production_multiplier: 1.5,
        conquer_cost_multiplier: 0.5,
    },
    Milestone {
        military_multiplier: 1.6,
        production_multiplier: 1.6,
        conquer_cost_multiplier: 0.4,
    },
    Milestone {
        military_multiplier: 1.7,
        production_multiplier: 1.7,
        conquer_cost_multiplier: 0.3,
    },
    Milestone {
        military_multiplier: 1.8,
        production_multiplier: 1.8,
        conquer_cost_multiplier: 0.2,
    },
    Milestone {
        military_multiplier: 1.9,
        production_multiplier: 1.9,
        conquer_cost_multiplier: 0.1,
    }

];

