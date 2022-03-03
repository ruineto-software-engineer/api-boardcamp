import connection from "../db.js";

export async function registerGame(req, res) {
  const game = req.body;
  if(game.name === " "){
    res.sendStatus(400);
    return;
  }

  try {
    const queryCategories = await connection.query(`SELECT * FROM categories`);
    const searchedCategories = queryCategories.rows.find(queryCategory => queryCategory.id === game.categoryId);

    const queryGames = await connection.query(`SELECT * FROM games`);
    const seachedGame = queryGames.rows.find(queryGame => queryGame.name === game.name);

    if(searchedCategories !== undefined){
      if(seachedGame === undefined){
        await connection.query(`
          INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay")
          VALUES ($1, $2, $3, $4, $5)
        `, [game.name, game.image, parseInt(game.stockTotal), game.categoryId, parseInt(game.pricePerDay)]);
    
        res.sendStatus(201);
      }else{
        res.sendStatus(409);
        return;
      }
    }else{
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
    if(name === undefined){
      const queryGames = await connection.query(`
        SELECT games.*, categories.name as "categoryName" FROM games 
        JOIN categories ON games."categoryId"=categories.id
      `);
  
      res.send(queryGames.rows);
    }else{
      const queryGamesCase = await connection.query(`
        SELECT games.*, categories.name as "categoryName" FROM games 
        JOIN categories ON games."categoryId"=categories.id 
        WHERE games.name LIKE $1
      `, [`${name}%`]);

      res.send(queryGamesCase.rows);
    }
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
}