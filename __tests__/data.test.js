const path = require("path");
const data = require("../data");

describe("data/index", () => {
  test("carrega todas as famílias e normaliza ids", () => {
    expect(data.familias).toBeDefined();
    const keys = Object.keys(data.familias);
    expect(keys.length).toBeGreaterThan(0);

    // Confere uma família conhecida
    const familia = data.familias["nutri_rose"];
    expect(familia).toBeDefined();
    expect(familia.nome).toMatch(/Nutri/);
    expect(familia.atributos).toBeDefined();

    // Lista e objeto devem ser consistentes
    const listaIds = data.familiasLista.map((f) => f.id);
    expect(listaIds).toEqual(keys);
  });

  test("fallback de id baseado no nome do arquivo", () => {
    const baseName = path.basename(
      path.join(__dirname, "../data/nutri_rose.json"),
      ".json"
    );
    expect(baseName).toBe("nutri_rose");
    const familia = data.familias[baseName];
    expect(familia.id).toBe(baseName);
  });
});
