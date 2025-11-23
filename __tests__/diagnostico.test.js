const request = require("supertest");
const app = require("../server");

describe("Endpoint de diagnóstico", () => {
  test("POST /api/diagnostico retorna recomendação", async () => {
    const payload = {
      tipoCabelo: "ondulado",
      condicao: "ressecado",
      objetivo: "hidratação",
    };

    const response = await request(app)
      .post("/api/diagnostico")
      .send(payload)
      .expect(200);

    expect(response.body).toHaveProperty("mensagem");
    expect(response.body).toHaveProperty("recomendadas");
    expect(Array.isArray(response.body.recomendadas)).toBe(true);
    expect(response.body.recomendadas.length).toBeGreaterThan(0);
  });

  test("POST /api/diagnostico com body inválido retorna 400", async () => {
    const response = await request(app).post("/api/diagnostico").send({}).expect(400);

    expect(response.body).toHaveProperty("errorCode", "INVALID_BODY");
    expect(response.body).toHaveProperty("message");
  });
});
