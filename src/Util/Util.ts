import {Vector3} from "three";
import * as THREE from "three";

export const calculateSum = (numbers: number[]) => numbers.reduce((a, b) => a + b, 0);

export const countNumbers = (numbers: number[], target: number) => numbers.filter(n => n === target).length;

export const getSelectedDicePosition = (index: number): Vector3 => {
    const x = -15 + (5 * index);
    return new THREE.Vector3(x, 0.001, -20);
};