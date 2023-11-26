import { useEffect, useRef, useState } from "react";
import {
  Engine,
  Render,
  Runner,
  Bodies,
  Composite,
  Detector,
  Events,
  Body,
} from "matter-js";
import "./App.css";
import fruitTypes from "./FruitTypes.ts";

function Game() {
  const scene = useRef();
  const isPressed = useRef(false);
  const engine = useRef(Engine.create());
  const runner = useRef(Runner.create());
  const detector = useRef(Detector.create());

  Events.on(engine.current, "collisionStart", (event) => {
    let pairs = event.pairs;
    for (const pair of pairs) {
      if (pair.bodyA.label === pair.bodyB.label) {
        console.log("collision !!");
        onCollision(pair.bodyA, pair.bodyB);
      }
    }
  });

  const onCollision = (bodyA: Body, bodyB: Body) => {
    Composite.remove(engine.current.world, bodyB);
    const newFruitIndex = parseInt(bodyA.label.slice(1)) + 1;
    const newFruit = fruitTypes[newFruitIndex];
    const ball = Bodies.circle(
      bodyA.position.x,
      bodyA.position.y,
      newFruit.size,
      {
        mass: newFruit.mass,
        restitution: newFruit.restitution,
        friction: newFruit.friction,
        density: newFruit.density,
        label: newFruit.label,
        render: newFruit.render,
      }
    );
    Composite.add(engine.current.world, [ball]);
    Detector.setBodies(
      detector.current,
      Composite.allBodies(engine.current.world)
    );
    Composite.remove(engine.current.world, bodyA);
  };

  useEffect(() => {
    // Game width/height
    const cw = 450;
    const ch = 800;
    // Game position relative to screen
    const ccx = document
      .querySelector("#gameCanvas")!
      .getBoundingClientRect().x;
    const ccy = document
      .querySelector("#gameCanvas")!
      .getBoundingClientRect().y;

    const render = Render.create({
      element: scene.current,
      engine: engine.current,
      options: {
        width: cw,
        height: ch,
        wireframes: false,
        background: "transparent",
      },
    });

    // Bounds
    Composite.add(engine.current.world, [
      Bodies.rectangle(cw / 2, -10, cw, 20, { isStatic: true }),
      Bodies.rectangle(-10, ch / 2, 20, ch, { isStatic: true }),
      Bodies.rectangle(cw / 2, ch + 10, cw, 20, { isStatic: true }),
      Bodies.rectangle(cw + 10, ch / 2, 20, ch, { isStatic: true }),
    ]);

    Render.run(render);
    Runner.run(runner.current, engine.current);

    return () => {
      Render.stop(render);
      Composite.clear(engine.current.world, false);
      Detector.clear(detector.current);
      Engine.clear(engine.current);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  const handleDown = () => {
    isPressed.current = true;
  };

  const handleUp = (e: any) => {
    isPressed.current = false;
    handleAddCircle(e);
  };

  const handleMove = () => {};

  const handleAddCircle = (e: {
    clientX: number;
    target: { offsetLeft: number; offsetTop: number };
    clientY: number;
  }) => {
    const randomFruit = fruitTypes[Math.floor(Math.random() * 4)];
    const ball = Bodies.circle(
      e.clientX - e.target.offsetLeft,
      0,
      randomFruit.size,
      {
        mass: randomFruit.mass,
        restitution: randomFruit.restitution,
        friction: randomFruit.friction,
        density: randomFruit.density,
        label: randomFruit.label,
        render: randomFruit.render,
      }
    );
    Composite.add(engine.current.world, [ball]);
    Detector.setBodies(
      detector.current,
      Composite.allBodies(engine.current.world)
    );
  };

  return (
    <div
      id="gameCanvas"
      onMouseDown={handleDown}
      onMouseUp={handleUp}
      onMouseMove={handleMove}
    >
      <div ref={scene} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}

export default Game;
