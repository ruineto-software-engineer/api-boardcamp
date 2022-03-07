import connection from "../db.js";

export async function registerGame(req, res) {
  const game = req.body;
  if (game.name === " ") {
    res.sendStatus(400);
    return;
  }

  try {
    const queryCategories = await connection.query(`SELECT * FROM categories`);
    const searchedCategory = queryCategories.rows.find(queryCategory => queryCategory.id === game.categoryId);

    const queryGames = await connection.query(`SELECT * FROM games`);
    const seachedGame = queryGames.rows.find(queryGame => queryGame.name === game.name);

    if (searchedCategory !== undefined) {
      if (seachedGame === undefined) {
        await connection.query(`
          INSERT INTO games 
            (name, image, "stockTotal", "categoryId", "pricePerDay")
          VALUES 
            ($1, $2, $3, $4, $5)
        `, [game.name, game.image, parseInt(game.stockTotal), game.categoryId, parseInt(game.pricePerDay)]);

        res.sendStatus(201);
      } else {
        res.sendStatus(409);
        return;
      }
    } else {
      res.sendStatus(400);
      return;
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}

export async function getGames(req, res) {
  const name = req.query.name;

  try {
    let offset = '';
    if (req.query.offset) {
      offset = `OFFSET ${req.query.offset}`;
    }

    let limit = '';
    if (req.query.limit) {
      limit = `LIMIT ${req.query.limit}`;
    }

    const orderByFilter = {
      id: 1,
      name: 2,
      image: 3,
      stockTotal: 4,
      categoryId: 5,
      pricePerDay: 6
    }
    let orderBy = 'ORDER BY games.id';
    if (req.query.order && orderByFilter[req.query.order] && req.query.desc === undefined) {
      orderBy = `ORDER BY ${orderByFilter[req.query.order]}`;
    } else if (req.query.order && orderByFilter[req.query.order] && req.query.desc){
      orderBy = `ORDER BY ${orderByFilter[req.query.order]} DESC`;
    }

    if (name === undefined) {
      const queryGames = await connection.query(`
        SELECT 
          games.*, 
          categories.name AS "categoryName",
          COUNT(rentals.id) "rentCount"
        FROM games 
          LEFT JOIN rentals ON games.id=rentals."gameId"
          JOIN categories ON games."categoryId"=categories.id
        GROUP BY games.id, categories.name
        ${orderBy}
          ${offset}
          ${limit}
      `);

      res.send(queryGames.rows);
    } else {
      const queryGamesCase = await connection.query(`
        SELECT 
          games.*, 
          categories.name AS "categoryName" 
        FROM games 
          JOIN categories ON games."categoryId"=categories.id 
        WHERE LOWER(games.name) LIKE LOWER($1)
        ${orderBy}
          ${offset}
          ${limit}
      `, [`${name}%`]);

      res.send(queryGamesCase.rows);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}