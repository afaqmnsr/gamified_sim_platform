export class Place {
    constructor(id, tokens = 0) {
        this.id = id;
        this.tokens = tokens;
    }
}

export class Transition {
    constructor(id) {
        this.id = id;
        this.inputs = [];  // places that lead to this transition
        this.outputs = []; // places that this transition leads to
    }
}

export class Arc {
    constructor(source, target) {
        this.source = source;
        this.target = target;
    }
}

export class PetriNet {
    constructor() {
        this.places = [];
        this.transitions = [];
        this.arcs = [];
    }

    addPlace(place) {
        this.places.push(place);
    }

    addTransition(transition) {
        this.transitions.push(transition);
    }

    addArc(arc) {
        this.arcs.push(arc);
        if (arc.source instanceof Place && arc.target instanceof Transition) {
            arc.target.inputs.push(arc.source);
        } else if (arc.source instanceof Transition && arc.target instanceof Place) {
            arc.source.outputs.push(arc.target);
        }
    }

    getPlace(id) {
        return this.places.find(p => p.id === id);
    }

    getEnabledTransitions() {
        return this.transitions.filter(t => t.inputs.every(p => p.tokens > 0));
    }

    fire(transition) {
        if (!this.getEnabledTransitions().includes(transition)) return false;

        transition.inputs.forEach(p => p.tokens--);
        transition.outputs.forEach(p => p.tokens++);

        return true;
    }

    clone() {
        const cloned = new PetriNet();
        const placeMap = new Map();

        this.places.forEach(p => {
            const newPlace = new Place(p.id, p.tokens);
            placeMap.set(p.id, newPlace);
            cloned.addPlace(newPlace);
        });

        this.transitions.forEach(t => {
            const newT = new Transition(t.id);
            cloned.addTransition(newT);
        });

        this.arcs.forEach(arc => {
            const source = placeMap.get(arc.source.id) || cloned.transitions.find(t => t.id === arc.source.id);
            const target = placeMap.get(arc.target.id) || cloned.transitions.find(t => t.id === arc.target.id);
            if (source && target) {
                cloned.addArc(new Arc(source, target));
            }
        });

        return cloned;
    }
}
