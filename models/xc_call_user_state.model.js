const pool = require("./db.js");

//목록 조회
const select_user = async() => {
    console.log('select_user');

	const connection = await pool.getConnection(async(conn) => conn);
    const [rows, fields] = await pool.query(`SELECT * FROM xc_call_user_state;`);
    // console.log('쿼리 결과:', rows);
    pool.releaseConnection(connection);
    return rows;
}

//방에 유저 생성
const create_user = async() => {
    console.log('create_user');




	// const connection = await pool.getConnection(async(conn) => conn);
    // const [rows, fields] = await pool.query(`SELECT * FROM xc_call_user_state;`);
    // // console.log('쿼리 결과:', rows);
    // pool.releaseConnection(connection);
    // // pool.release();
    // return rows;
}

//방에 유저 업데이트
const update_user = async() => {
    console.log('update_user');

	// const connection = await pool.getConnection(async(conn) => conn);
    // const [rows, fields] = await pool.query(`SELECT * FROM xc_call_user_state;`);
    // // console.log('쿼리 결과:', rows);
    // pool.releaseConnection(connection);
    // // pool.release();
    // return rows;
}


//방 삭제
const delete_user = async() => {
    console.log('delete_user');

	// const connection = await pool.getConnection(async(conn) => conn);
    // const [rows, fields] = await pool.query(`SELECT * FROM xc_call_user_state;`);
    // // console.log('쿼리 결과:', rows);
    // pool.releaseConnection(connection);
    // // pool.release();
    // return rows;
}

  module.exports = {
    select_user,
    create_user,
    update_user,
    delete_user,
}