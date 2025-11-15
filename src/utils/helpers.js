/**
 * Actualiza un elemento en el estado por ID.
 * Funciona tanto si el estado es un array o un solo objeto.
 * @param {Function} set - La función set de Zustand
 * @param {string} stateKey - La clave del estado a actualizar
 * @param {number|string} id - ID del elemento a actualizar
 * @param {Object} newData - Nuevo valor del elemento
 */
export const updateById = (set, stateKey, id, newData) => {
  set(state => {
    const stateValue = state[stateKey];

    if (Array.isArray(stateValue)) {
      return {
        [stateKey]: stateValue.map(item => item.id === id ? newData : item)
      };
    }

    if (stateValue?.id === id) {
      return { [stateKey]: newData };
    }

    return state; // Si no coincide, no se cambia nada
  });
};
