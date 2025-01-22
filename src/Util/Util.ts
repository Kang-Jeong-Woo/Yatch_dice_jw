import {Vector3} from "three";
import * as THREE from "three";
import Dice from "../components/Dice.ts";

export const calculateSum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0);

export const countNumbers = (numbers: number[], target: number) => numbers.filter(n => n === target).length;

export const getSelectedDicePosition = (index: number): Vector3 => {
    const x = -10 + (5 * index);
    return new THREE.Vector3(x, 1.001, -20);
};

export const areAllDiceAsleep = (diceArray: Dice[]): boolean => {
    return diceArray.every(dice => dice.isSleep);
}