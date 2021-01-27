import * as THREE from 'three';
import Element from './Element';
import Point from './Point';
import Segment from './Segment';
import RectangleView from '../Components/Canvas/RectangleView';
import { createAccordion, createAccordionItem } from '../Utils/generators';

type Edge = [number, number];

export default class Graph extends Element {
  readonly vertices: Array<Point>;
  readonly edges: Array<Segment | Edge>;

  private constructor(vertices: Array<Point>, edges: Array<Segment | Edge>) {
    super('graph');
    this.vertices = vertices;
    this.edges = edges;

    this.vertices.forEach((v) => (v.color = this.color));
    this.edges.forEach((e) => {
      if (e instanceof Segment) {
        e.color = this.color;
      }
    });
  }

  static fromVerticesEdges(vertices: Array<Point>, edges: Array<Edge>): Graph {
    const segments = edges.map((e) => {
      if (e[0] < vertices.length && e[1] < vertices.length) {
        return Segment.fromSide([vertices[e[0]], vertices[e[1]]]);
      }
      return e;
    });
    return new Graph(vertices, segments);
  }

  info(name: string, parent: string, id: string) {
    const newId = `${id}_data`;
    const verticesId = `${newId}_vertices`;
    const vertices = createAccordion(
      `${verticesId}_data`,
      this.vertices.map((v, ind) =>
        v.info(`vertex_${ind}`, `${verticesId}_data`, `${verticesId}_${ind}`),
      ),
    );
    const edgesId = `${newId}_edges`;
    const edges = createAccordion(
      `${edgesId}_data`,
      this.edges.map((e, ind) => {
        const edgeId = `${edgesId}_${ind}`;
        if (e instanceof Segment) {
          return e.info(`edge_${ind}`, `${edgesId}_data`, edgeId);
        } else {
          const newEdgeId = `${edgeId}_data`;
          const edgeBody = createAccordion(
            newEdgeId,
            e.map((i, j) => {
              if (i < this.vertices.length) {
                return this.vertices[i].info(
                  `vertex${j + 1}`,
                  newEdgeId,
                  `${edgeId}_vertex${j + 1}`,
                );
              } else {
                return createAccordionItem(
                  newEdgeId,
                  `vertex${j + 1}`,
                  `Vertex by index ${i} is undefined`,
                  `${edgeId}_vertex${j + 1}`,
                );
              }
            }),
          );
          return createAccordionItem(
            `${edgesId}_data`,
            `edge_${ind}`,
            edgeBody,
            edgeId,
          );
        }
      }),
    );
    const body = createAccordion(newId, [
      createAccordionItem(newId, 'vertices', vertices, verticesId),
      createAccordionItem(newId, 'edges', edges, edgesId),
    ]);
    return createAccordionItem(parent, name, body, id);
  }

  inRectangle(rectangle: RectangleView) {
    for (const vertex of this.vertices) {
      if (vertex.inRectangle(rectangle)) {
        return true;
      }
    }
    return false;
  }

  draw(rectangle: RectangleView) {
    const group = new THREE.Group();
    this.edges.forEach((e) => {
      if (e instanceof Segment) {
        group.add(e.draw(rectangle));
      }
    });
    this.vertices.forEach((v) => group.add(v.draw(rectangle)));
    return group;
  }
}
