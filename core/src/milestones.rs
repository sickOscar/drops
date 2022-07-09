
pub enum Milestones {
    Alpha,
    Beta,
    Gamma,
    Delta,
    Epsilon,
    Zeta,
    Eta,
    Theta,
    Iota,
    Kappa,
    Lambda,
    Mu,
    Nu,
    Xi,
    Omicron,
    Pi,
    Rho,
    Sigma,
    Tau,
    Upsilon,
    Phi,
    Chi,
    Psi,
    Omega,
}

pub struct Milestone {
    pub name: &'static str,
    pub military_multiplier: f32,
    pub production_multiplier: f32,
    pub research_multiplier: f32,
    pub conquer_cost_multiplier: f32,
}

pub const MILESTONES:[Milestone; 10] = [
    Milestone {
        name: "Beta",
        military_multiplier: 1.0,
        production_multiplier: 1.0,
        research_multiplier: 1.0,
        conquer_cost_multiplier: 1.0,
    },
    Milestone {
        name: "Rookie",
        military_multiplier: 1.1,
        production_multiplier: 1.1,
        research_multiplier: 1.1,
        conquer_cost_multiplier: 1.1,
    },
    Milestone {
        name: "Veteran",
        military_multiplier: 1.2,
        production_multiplier: 1.2,
        research_multiplier: 1.2,
        conquer_cost_multiplier: 1.2,
    },
    Milestone {
        name: "Elite",
        military_multiplier: 1.3,
        production_multiplier: 1.3,
        research_multiplier: 1.3,
        conquer_cost_multiplier: 1.3,
    },
    Milestone {
        name: "Master",
        military_multiplier: 1.4,
        production_multiplier: 1.4,
        research_multiplier: 1.4,
        conquer_cost_multiplier: 1.4,
    },
    Milestone {
        name: "Grandmaster",
        military_multiplier: 1.5,
        production_multiplier: 1.5,
        research_multiplier: 1.5,
        conquer_cost_multiplier: 1.5,
    },
    Milestone {
        name: "Legendary",
        military_multiplier: 1.6,
        production_multiplier: 1.6,
        research_multiplier: 1.6,
        conquer_cost_multiplier: 1.6,
    },
    Milestone {
        name: "Mythical",
        military_multiplier: 1.7,
        production_multiplier: 1.7,
        research_multiplier: 1.7,
        conquer_cost_multiplier: 1.7,
    },
    Milestone {
        name: "Immortal",
        military_multiplier: 1.8,
        production_multiplier: 1.8,
        research_multiplier: 1.8,
        conquer_cost_multiplier: 1.8,
    },
    Milestone {
        name: "Godlike",
        military_multiplier: 1.9,
        production_multiplier: 1.9,
        research_multiplier: 1.9,
        conquer_cost_multiplier: 1.9,
    }

];

