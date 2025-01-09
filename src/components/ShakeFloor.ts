// 흔들기 파라미터
const SHAKE_STRENGTH = 5.0; // 흔들기 강도
const SHAKE_DURATION = 1000; // 흔들기 지속시간 (밀리초)
let isShaking = false;
let shakeStartTime = 0;

// 흔들기 함수
function shakeFloor() {
    if (isShaking) return;

    isShaking = true;
    shakeStartTime = Date.now();

    function animate() {
        const elapsed = Date.now() - shakeStartTime;

        if (elapsed < SHAKE_DURATION) {
            // 상하좌우 랜덤 움직임 생성
            const xOffset = (Math.random() - 0.5) * SHAKE_STRENGTH;
            const yOffset = (Math.random() - 0.5) * SHAKE_STRENGTH;
            // const yOffset = Math.abs(Math.random()) * SHAKE_STRENGTH; // y는 위로만 올라가도록
            const zOffset = (Math.random() - 0.5) * SHAKE_STRENGTH;

            // Rapier 물리 엔진의 강체 위치 업데이트
            floorBody.setTranslation(
                { x: xOffset, y: -1 + yOffset, z: zOffset },
                true
            );

            // Three.js 메시 위치 업데이트
            floorMesh.position.set(xOffset, -1 + yOffset, zOffset);

            requestAnimationFrame(animate);
        } else {
            // 원래 위치로 복귀
            floorBody.setTranslation({ x: 0, y: -1, z: 0 }, true);
            floorMesh.position.set(0, -1, 0);
            isShaking = false;
        }
    }

    animate();
}



// 흔들기 파라미터 조정
const SHAKE_STRENGTH2 = 1.5; // 흔들기 강도를 약간 줄임
const SHAKE_DURATION2 = 2000; // 지속시간을 늘림
const SHAKE_FREQUENCY = 0.015; // 진동 주파수 (낮을수록 부드러움)
let isShaking2 = false;
let shakeStartTime2 = 0;

function shakeFloor() {
    if (isShaking) return;

    isShaking = true;
    shakeStartTime = Date.now();

    function animate() {
        const elapsed = Date.now() - shakeStartTime;
        const progress = elapsed / SHAKE_DURATION;

        if (elapsed < SHAKE_DURATION) {
            // 사인파를 사용하여 더 부드러운 움직임 생성
            const wave = Math.sin(elapsed * SHAKE_FREQUENCY);
            const intensity = Math.max(0, 1 - progress); // 시간이 지날수록 강도 감소

            // 각 축별로 다른 진동 패턴 적용
            const xOffset = Math.sin(elapsed * SHAKE_FREQUENCY * 1.1) * SHAKE_STRENGTH * intensity;
            const yOffset = Math.abs(wave) * SHAKE_STRENGTH * intensity;
            const zOffset = Math.sin(elapsed * SHAKE_FREQUENCY * 0.9) * SHAKE_STRENGTH * intensity;

            // 바닥의 위치와 회전 업데이트
            const rotation = wave * 0.05 * intensity; // 약간의 회전 추가

            floorBody.setTranslation(
                { x: xOffset, y: -1 + yOffset, z: zOffset },
                true
            );

            // 회전 적용 (Rapier)
            floorBody.setRotation(
                { x: rotation, y: 0, z: rotation, w:0 },
                true
            );

            // Three.js 메시 업데이트
            floorMesh.position.set(xOffset, -1 + yOffset, zOffset);
            floorMesh.rotation.x = rotation;
            floorMesh.rotation.z = rotation;

            requestAnimationFrame(animate);
        } else {
            // 부드럽게 원위치로 복귀
            floorBody.setTranslation({ x: 0, y: -1, z: 0 }, true);
            floorBody.setRotation({ x: 0, y: 0, z: 0, w:0 }, true);
            floorMesh.position.set(0, -1, 0);
            floorMesh.rotation.set(0, 0, 0);
            isShaking = false;
        }
    }

    animate();
}



// 용수철 효과 파라미터
const SPRING_STRENGTH = 3.0; // 탄성 강도
const INITIAL_DROP = 4.0; // 초기 낙하 거리
const SHAKE_DURATION3 = 1500; // 전체 지속시간
const BOUNCE_FREQUENCY = 0.008; // 튀는 주파수
let isShaking3 = false;
let shakeStartTime3 = 0;

function shakeFloor() {
    if (isShaking) return;

    isShaking = true;
    shakeStartTime = Date.now();

    function animate() {
        const elapsed = Date.now() - shakeStartTime;
        const progress = elapsed / SHAKE_DURATION;

        if (elapsed < SHAKE_DURATION) {
            // 지수적으로 감소하는 용수철 효과
            const springEffect = Math.exp(-progress * 3) * Math.sin(elapsed * BOUNCE_FREQUENCY);

            // 초기에 강하게 내려가는 효과
            const dropEffect = Math.exp(-progress * 5) * INITIAL_DROP;

            // y축 움직임 (용수철 + 낙하 효과 결합)
            const yOffset = -dropEffect + springEffect * SPRING_STRENGTH;

            // x와 z축은 약간의 흔들림만 추가
            const xOffset = springEffect * 0.5;
            const zOffset = springEffect * 0.5;

            // 약간의 회전 효과 추가
            const rotation = springEffect * 0.1;

            // Rapier 물리 바디 업데이트
            floorBody.setTranslation(
                { x: xOffset, y: -1 + yOffset, z: zOffset },
                true
            );
            floorBody.setRotation(
                { x: rotation, y: 0, z: rotation, w:0 },
                true
            );

            // Three.js 메시 업데이트
            floorMesh.position.set(xOffset, -1 + yOffset, zOffset);
            floorMesh.rotation.x = rotation;
            floorMesh.rotation.z = rotation;

            // 충격파 효과를 위한 빠른 스케일 변화
            if (elapsed < 100) { // 초기 충격 시 잠깐 납작해짐
                const scaleY = 1 - (dropEffect * 0.1);
                const scaleXZ = 1 + (dropEffect * 0.05);
                floorMesh.scale.set(scaleXZ, scaleY, scaleXZ);
            } else {
                floorMesh.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
            }

            requestAnimationFrame(animate);
        } else {
            // 원래 상태로 복귀
            floorBody.setTranslation({ x: 0, y: -1, z: 0 }, true);
            floorBody.setRotation({ x: 0, y: 0, z: 0, w:0 }, true);
            floorMesh.position.set(0, -1, 0);
            floorMesh.rotation.set(0, 0, 0);
            floorMesh.scale.set(1, 1, 1);
            isShaking = false;
        }
    }

    animate();
}