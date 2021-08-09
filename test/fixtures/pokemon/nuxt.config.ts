import defu from "defu";

const config = defu.arrayFn(require('../shared/nuxt.config').default, {
  hydration: {
    mode: 'none'
  },
  generate: {
    async routes() {
      const getPokedex = () => import('./pokedex.json').then(m => m.default || m)
      const pokemons = (await getPokedex()).slice(0, 100)
      // @ts-ignore
      return pokemons.map((pokemon, index) => {
        return {
          route: '/pokemon/' + pokemon.id,
          payload: {
            pokemon,
            pokemons: pokemons.slice(Math.max(index - 9, 0), Math.min(index + 11, 20))
          }
        }
      })
    }
  }
})

export default config
