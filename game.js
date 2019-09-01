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
   * @param {number} winsToUse The number of wins a player needs before they can use the modifier
   * @param {number} allowedUseCount The number of times the player can use the mod
   */
  constructor(modifies, shortName, value, description, winsToUse, allowedUseCount, key) {
    this._modifies = modifies;
    this._shortName = shortName;
    this._value = value;
    this._description = description;
    this._winsToUse = winsToUse;
    this._allowedUseCount = allowedUseCount;
    this._totalMods = allowedUseCount;
    this._key = key
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

  get winsToUse() {
    return this._winsToUse
  }

  get allowedUseCount() {
    return this._totalMods
  }

  /**
   * 
   * @param {Player} player 
   * @param {boolean} inUse
   */
  setStatus(player, inUse) {

    // This needs to set the checked and enabled
    if (this._totalMods <= 0) {
      inUse = false
    }

    let modIndex = player._modifiers.findIndex(key => key === this._key)

    if (inUse && modIndex === -1) {
      player._modifiers.push(this._key)
    } else if (!inUse && modIndex > -1) {
      player._modifiers.splice(modIndex, 1)
    }
  }

  /**
   * @param {Player} player 
   * @param {number} modType MOD_TYPE.DEFENSE | MOD_TYPE.OFFENSE
   * @returns {object} {template: string, value: number}
   * --NOTE This function decreases _totalMods
   */
  getModValues(player, modType) {
    let result = { template: '', value: 0 }

    if (this._modifies !== modType) {
      return result
    }

    if (player.winCount >= this._winsToUse && this._totalMods > 0) {
      this._totalMods--
      this.setStatus(player, player._modifiers.findIndex(key => key === this._key) > -1)
      return {
        template: `<p>${this.description} (<b>${this._value}pts</b>)</p>`,
        value: modType === MODIFIER_TYPE.OFFENSE ?
          this._value : -this._value
      }
    }
    return result
  }

  /** @param {Player} player */
  modUnlocked(player) {
    return player.winCount >= this.winsToUse && this._totalMods > 0 ?
      '' :
      'disabled'
  }

  /** @param {Player} player*/
  modChecked(player) {
    return player._modifiers.findIndex(mod => mod === this._key) > -1 && this._totalMods > 0 ?
      'checked' :
      ''
  }

  /**
   * 
   * @param {Player} player 
   */
  getTemplate(player) {
    let key = this._key
    let template = `
        <div class="form-check ml-4" style="display: block;">
          <input
            id="cb-${key}"
            onchange="onModChange(event, '${player.name}', '${key}')"
            class="form-check-input"
            type="checkbox"
            ${this.modUnlocked(player)}
            ${this.modChecked(player)}
          >
          <label class="form-check-label" for="defaultCheck1">
            ${this._shortName} (${this._totalMods})
          </label>
        </div>
      `
    return template
  }


}

class Player {
  constructor(name, health, domElement) {
    this._name = name;
    this._health = health;
    this._attacks = {}
    // This is an object that holds four modifiers. Acces them by [key]
    this._modifier = {}
    /** @type {Array<string>} These are the modiifer keys in use*/
    this._modifiers = []
    this._element = domElement
    this._winCount = 0

    this.setTitle()
  }

  setTitle() {
    let id = `${this._name.toLowerCase()}-title`
    document.getElementById(id).innerText = `${this._name} ${this._health} health pts`
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

  get winCount() {
    return this._winCount
  }

  addWin() {
    this._winCount++
  }

  underGoAttack(damage) {
    this._health -= damage
    return this.health
  }

  getModValues(modType) {
    let template = ''
    let modDamage = 0
    let keys = [...this._modifiers]
    keys.forEach(key => {
      /** @type {Modifier} */
      let mod = this.modifier[key]
      let modValues = mod.getModValues(this, modType)
      template += modValues.template
      modDamage += modValues.value
    })

    return {
      template: template,
      value: modDamage
    }
  }

  /**
   * 
   * @param {string} type The type of attack
   * @param {Player} opponent 
   */
  attack(type, opponent) {
    let opponentDefenseId = `#${opponent._name.toLowerCase()}-defense`
    let myDefenseId = `#${this._name.toLowerCase()}-defense`


    // Clear attack and mod defense sentances
    $('#attack-sentance').animate({ opacity: '0' }, 1)
    $(opponentDefenseId).animate({ opacity: '0' }, 250)
    $(myDefenseId).animate({ opacity: '0' }, 250)

    let mySide
    let theirSide

    if (this._name === 'Human') {
      mySide = 'justify-content-start'
      theirSide = 'justify-content-end'
    } else {
      mySide = 'justify-content-end'
      theirSide = 'justify-content-start'
    }

    $('#attack-sentance').removeClass(theirSide)
    $('#attack-sentance').addClass(mySide)
    $('#attack-row').removeClass(theirSide)
    $('#attack-row').addClass(mySide)

    // Clear the last attack sentance in the arean
    // $('#attack-sentance').animate({ opacity: '0' }, 250)

    let attackValues = this._attacks[type]

    let modValues = this.getModValues(MODIFIER_TYPE.OFFENSE)
    let theirModValues = opponent.getModValues(MODIFIER_TYPE.DEFENSE)

    // Load the current attack sentance
    modValues.value += attackValues.damage + theirModValues.value
    modValues.template += `<p><b>${attackValues.description} Total Damage ${modValues.value}</b></p>`

    // Attack the opponent. This decreases their _health
    // TODO This needs to decreas their defensive mod value if checked
    opponent.underGoAttack(modValues.value)

    // Check if this player is a winner
    // This resets everybodys _health and adds "Winner" attack sentance
    if (opponent.health <= 0) {
      this._winCount++
      this._health = 100
      opponent.health = 100
      modValues.template += `<h2>${this._name} Wins!</h2>`
    }

    // display opponents defense sentance
    $(opponentDefenseId)
      .html(theirModValues.template)
      .animate({ opacity: '1' }, 250)

    // Dispaly the attack sentance
    $('#attack-sentance')
      .html(modValues.template)
      .delay(750)
      .animate({ opacity: '1' }, 250)

    // Set the title for each player.
    // This shows their health
    this.setTitle()
    opponent.setTitle()

    // Set attack object url by changing the class: SEE style.css
    $('#attack-object').attr('class', type)

    // Animate the attack object
    $('#attack-object')
      .animate({ top: '88px' }, 700).delay(250)
      .animate({ top: '-88px' }, 700)

    $('#battle-arena').delay(1500).animate({ opacity: '0' }, 250)
  }

  // modUnlocked(key) {
  //   return this._winCount >= this._modifier[key].winsToUse ?
  //     '' :
  //     'disabled'
  // }

  // modChecked(key) {
  //   return this._modifiers.findIndex(mod => mod === key) > -1 ?
  //     'checked' :
  //     ''
  // }

  get ModifierTemplate() {
    let template = ''

    Object.keys(this._modifier).forEach(key => {
      /** @type {Modifier} */
      let mod = this._modifier[key]
      template += mod.getTemplate(this)
      // template += `
      //   <div class="form-check ml-4" style="display: block;">
      //     <input
      //       id="cb-${key}"
      //       onchange="onModChange(event, '${this._name}', '${key}')"
      //       class="form-check-input"
      //       type="checkbox"
      //       ${this.modUnlocked(key)}
      //       ${this.modChecked(key)}
      //     >
      //     <label class="form-check-label" for="defaultCheck1">
      //       ${mod.shortName} (${mod.allowedUseCount})
      //     </label>
      //   </div>
      // `
    })
    return template
  }

  /** This adds or removes a mod key form _modifiers */
  setMod(inUse, modKey) {
    let modIndex = this._modifiers.findIndex(key => key === modKey)

    if (inUse && modIndex === -1) {
      this._modifiers.push(modKey)
    } else if (!inUse && modIndex > -1) {
      this._modifiers.splice(modIndex, 1)
    }
  }
}

class Cat extends Player {
  constructor(name, health, domElement) {
    super(name, health, domElement)

    this.element = domElement

    this._attacks = {
      'scratch': { damage: 20, description: 'Scratch!!!' },
      'bite': { damage: 15, description: 'Bite!!!' },
      'cat-grab': { damage: 30, description: 'With both paws. Grab!' },
      'grab-and-kick': { damage: 40, description: 'Grab and Kick!!!' }
    }
    this._modifier = {
      takeSweetTime: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Take Sweet Time', 5,
        'Irritate the human by testing their patience then...', 1, 2, 'takeSweetTime'
      ),
      ignoreHuman: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Ignore Human', 10,
        'Lower the human\'s confidence by making them feel unimportant, then...', 2, 1, 'ignoreHuman'
      ),
      purr: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Purrrrrr...', 15,
        'Make the human totally let their guard down, then...', 3, 1, 'purr'
      ),
      bolt: new Modifier(
        MODIFIER_TYPE.DEFENSE, 'Try to escape', 4,
        'With no indication... Twist and bolt!', 1, 500, 'bolt'
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
      'pet': { damage: 20, description: 'Pet the kitty' },
      'brush': { damage: 15, description: 'Brush the kitty' },
      'grab': { damage: 30, description: 'Grab the kitty!' },
      'push-down': { damage: 40, description: 'Smash the kitty' },
    }
    this._modifier = {
      giveCatNip: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Give the kitty some dope', 5,
        'Subdue the cat with an inhalent, then...', 1, 2, 'giveCatNip'
      ),
      useLaser: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Use laser pointer', 10,
        'Using a laser pointer, immeadiatly divert the cats attention, then...', 2, 1, 'useLaser'
      ),
      openBox: new Modifier(
        MODIFIER_TYPE.OFFENSE, 'Catdoras Box', 15,
        'Spark the cat\'s curiosity by oening a box.\nWhile the cat is peering into the abyss...', 3, 1, 'openBox'
      ),
      sleveDown: new Modifier(
        MODIFIER_TYPE.DEFENSE, 'Armor', 4,
        'Roll your sleve down to protect from scratches', 1, 2, 'sleveDown'
      )
    }
  }
}


let cat = new Cat('Cat', 100)
let human = new Human('Human', 100)

// http://bcw-sandbox.herokuapp.com/api/cars

function setBattleArenaImage(attacker) {
  let url
  if (attacker === 'human') {
    url = IMG.BA_CAT
  } else {
    url = IMG.BA_HUMAN
  }

  battleArena.style.backgroundImage = `url('${url}')`
  $('#battle-arena').animate({ opacity: '1' }, 250)
}

function attack(event, attacker, type) {
  event.preventDefault()

  setBattleArenaImage(attacker)

  switch (attacker) {
    case 'human':
      human.attack(type, cat)
      break
    case 'cat':
      cat.attack(type, human)
      break
  }

  drawModifiers()
}

function drawModifiers() {
  document.getElementById('human-mods').innerHTML = human.ModifierTemplate
  document.getElementById('cat-mods').innerHTML = cat.ModifierTemplate
}

function onModChange(event, playerName, modKey) {
  event.preventDefault()
  let inUse = event.target.checked
  switch (playerName) {
    case 'Cat':
      cat.setMod(inUse, modKey)
      break
    case 'Human':
      human.setMod(inUse, modKey)
      break
  }
}

drawModifiers()