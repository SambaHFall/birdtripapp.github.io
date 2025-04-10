hexchars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]

function random_hexchar(){
	return hexchars[ Math.floor( Math.random() * 16 ) ]
}

function random_color(){
	let col = "#"
	for(let i = 0 ; i < 6 ; i++){
		col = col + random_hexchar()
	}
	return col
}