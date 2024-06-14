/*
export const categoriesNames = [
    { value: CategoryEnum.Cage, text: 'Nicolas Cage' },
    { value: CategoryEnum.Pony, text: 'Ponies' }
];
*/

export const CategoryEnum = Object.freeze({
    Cage: 'cage',
    Pony: 'ponies'
});

export let minImageSize = 100;
export let isDebug = false;

export let category = Categories.Cage;
export let replacementProbability = 0.01; // between 0 and 1
export let increase = null; // a Date
export let name = "A friend";