const request = require("supertest");
const app = require("../server");
const { familias } = require("../data");

describe("Rotas de famílias", () => {
  test("GET /familias retorna lista com dados", async () => {
    const response = await request(app).get("/familias").expect(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0]).toHaveProperty("id");
    expect(response.body[0]).toHaveProperty("nome");
  });

  test("GET /familias/:id retorna família existente", async () => {
    const [primeiroId] = Object.keys(familias);
    const response = await request(app)
      .get(`/familias/${primeiroId}`)
      .expect(200);

    expect(response.body.id).toBe(primeiroId);
    expect(response.body).toHaveProperty("nome");
    expect(response.body).toHaveProperty("atributos");
  });

  test("GET /familias/:id inválido retorna 400", async () => {
    const response = await request(app).get("/familias/%20").expect(400);
    expect(response.body).toHaveProperty("errorCode", "INVALID_ID");
  });
});
