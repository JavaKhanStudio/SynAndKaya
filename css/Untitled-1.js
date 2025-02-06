// La mère
class Personne {
    constructor(nom) {
        this.nom = nom;
    }

    decrire() {
        return 'Mon nom est ' + this.nom;
    }

    presentation() {
        console.log(this.decrire());
    }
}

// Première fille
class Employer extends Personne {
    constructor(nom, position) {
        super(nom);
        this.position = position;
    }

    decrire() {
        return super.decrire() + " j'occupe le poste de " + this.position;
    }
}

// Deuxième fille
class Manager extends Employer {
    constructor(name, department) {
        super(name, 'Manager');
        this.department = department;
    }

    decrire() {
        return super.decrire() + " je suis en charge du département " + this.department;
    }
}

// La petite fille
class Directeur extends Manager {
    constructor(name) {
        super(name, 'tous');
    }

    decrire() {
        return Personne.prototype.decrire.call(this) + " et je suis le directeur";
    }
}
