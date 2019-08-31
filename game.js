let battleArena = document.getElementById('battle-arena')
let handImage = document.getElementById('hand')
let bushImage = document.getElementById('brush')

const IMG = {
  BA_CAT: './images/human-attack-base.png',
  BA_HUMAN: './images/human.png'
}

/**
 * Use this in a Modifier constructor as the 'modifies' argument
 */
const MODIFIER_TYPE = {
  /** @alias MODIFIER_TYPE.DEFENSE */
  DEFENSE: 0,
  /** @alias MODIFIER_TYPE.OFFENSE */
  OFFENSE: 1
}

class Modifier {
  /**
   * @param {number} modifies Says weather to modify "Defense" or "Offense" @see MODIFIER_TYPE
   * @param {string} shortName The name the user will use to identify the modifier
   * @param {number} value The numerical amount an attack is modified by
   * @param {string} description The short explaination of what the modifier does
   */
  constructor(modifies, shortName, value, description) {
    this._modifies = modifies;
    this._shortName = shortName;
    this._value = value;
    this._description = description;
  }
  /**
   * @returns MODIFIER_TYPE.DEFENSE | MODIFIER_TYPE.OFFENSE
   * @summary Says weather to modify "Defense" or "Offense"
   * @see MODIFIER_TYPE
   */
  get modifies() {
    return this._modifies
  }
  /**
   * @summary The name the user will use to identify the modifier
   */
  get shortName() {
    return this._shortName
  }
  /**
   * @summary The numerical amount an attack is modified by
   */
  get value() {
    return this._value
  }
  /**
   * @summary The short explaination of what the modifier does
   * */
  get description() {
    return this._description
  }

}

class Player {
  constructor(name, health, domElement) {
    this._name = name;
    this._health = health;
    this._attacks = {}
    this._modifier = {}
    this._modifiers = []
    this._element = domElement
  }

  get modifier() {
    return this._modifier
  }
  get attacks() {
    return this._attacks
  }

  get name() {
    return this._name
  }
  get health() {
    return this._health
  }
  set health(newValue) {
    this._health = newValue
  }
  get modifiers() {
    return this._modifiers
  }
  set modifiers(newValue) {
    this._modifiers = newValue
  }

  attack(type) {
    $('#attack-object').attr('class', type)

    $('#attack-object')
      .animate({ top: '88px' }, 500)
      .animate({ top: '-88px' }, 500)
    
    $('#battle-arena').delay(750).animate({ opacity: '0' }, 250)
  }
}

class Cat extends Player {
  constructor(name, health, domElement) {
    super(name, health, domElement)

    this.element = domElement

    this._attacks = {
      scratch: { damage: 20, url: '' },
      bite: { damage: 15, url: '' },
      catGrab: { damage: 30, url: '' },
      grabAndKick: { damage: 40, url: '' }
    }
    this._modifier = {
      takeSweetTime: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Take Sweet Time', 15,
        'Irritate the human by testing their patience'
      ),
      ignoreHuman: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Ignore Human', 10,
        'Lower the human\'s confidence by making them feel unimportant'
      ),
      purr: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Purrrrrr...', 15,
        'Make the human totally let their guard down'
      ),
      bolt: new Modifier(
        MODIFIER_TYPE.DEFENSE, 'Try to escape', 4,
        'With no indication... Twist and bolt!'
      )
    }
  }
}


const COLORS = {
  4: 'info',
  10: 'success',
  15: 'secondary',
  20: 'primary',
  30: 'warning',
  40: 'danger'
}

class Human extends Player {
  constructor(name, health) {
    super(name, health)

    this._attacks = {
      pet: { damage: 20, url: '' },
      brush: { damage: 15, url: '' },
      grab: { damage: 30, url: '' },
      pushDown: { damage: 40, url: '' }
    }
    this._modifier = {
      giveCatNip: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Give the kitty some dope', 15,
        'Subdue the cat with an inhalent'
      ),
      useLaser: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Use laser pointer', 10,
        'Immeadiatly divert the cats attention (Fully)'
      ),
      openBox: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Catdoras Box', 15,
        'Spark the cat\'s curiosity by oening a box'
      ),
      sleveDown: new Modifier(
        MODIFIER_TYPE.DEFENSE, 'Armor', 4,
        'Roll your sleve down to protect from scratches'
      )
    }
  }
}


let cat = new Cat('Tom', 100)
let human = new Human('Tim', 100)

// http://bcw-sandbox.herokuapp.com/api/cars

function setBattleArenaImage(attacker) {
  let url
  if (attacker === 'human') {
    url = IMG.BA_CAT
  } else {
    url = IMG.BA_HUMAN
  }

  battleArena.style.backgroundImage = `url('${url}')`
  $('#battle-arena').animate({opacity: '1'}, 250)
}

function attack(event, attacker, type) {
  event.preventDefault()

  setBattleArenaImage(attacker)



  switch (attacker) {
    case 'human':
      human.attack(type)
      break
    case 'cat':
      cat.attack(type)
      break
  }
}