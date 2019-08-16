/**
 * This number represents the player health
 * 0 (zero) means the playe has no health and
 * probably should be hospitalized
 * @type {number}
 * 
 */
let health = 100

/**
 * This is the "Target's" name
 * @type {string}
 * 
 */
let name = 'Cloud Monster'

/**
 * This tells us how many times the "Target"
 * was hit. It is incremented every time
 * an attack occures
 * @type {number}
 */
let hits = 0


/**
 * Slap!!!
 * This function decrements the global 'health' variable
 */
function slap() {
  health--
  hits++
  update()
}

/**
 * Punch!!!
 * This function decrements the global 'health'variable
 */
function punch() {
  health -= 5
  hits++
  update()
}

/**
 * Kick!!!
 * This function decrements the global 'health' variable
 */
function kick() {
  health -= 10
  hits++
  update()
}
/**
 * This function is the entry point for updating all
 * the visual elements on the DOM
 */
function update() {
  document.getElementById('health').innerText = health.toString()
  document.getElementById('name').innerText = name
  document.getElementById('hits').innerText = hits.toString()
}

update()