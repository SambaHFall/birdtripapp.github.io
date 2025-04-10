let yet_to_uncover = 0

let guessables


function levenshtein(str1, str2){
	l1 = str1.length
	l2 = str2.length
	mat = new Array(l1 + 1)
	for(let i = 0; i <= l1; i++){
		mat[i] = new Array(l2 + 1)
		mat[i][0] = i
	}
	for(let j = 0; j <= l2; j++){
		mat[0][j] = j
	}

	for(let i = 1; i <= l1; i++){
		for(let j = 1; j <= l2; j++){
			subCost = 1
			if(str1[i] == str2[j]){
				subCost = 0
			}
			mat[i][j] = Math.min( mat[i-1][j] + 1, mat[i][j-1] + 1, mat[i-1][j-1] + subCost )
		}
	}

	return mat[l1][l2]

}


class Guessable {

	constructor(element){
		this.element = element

		this.expectedValues = element.innerHTML.split(" ")

		this.entries = new Array(this.expectedValues.length)

		let isMaster = element.className.split(" ").includes("master")

		if(isMaster){
			yet_to_uncover += this.entries.length
		}

		let predspanid = element.id.split("-")[0] + "-pred"
		document.getElementById(predspanid).innerHTML = ""

		for(let i = 0; i < this.entries.length; i++){
			this.entries[i] = document.createElement("input")
			this.entries[i].setAttribute("type", "text")
			this.entries[i].setAttribute("position", "relative")
			this.entries[i].setAttribute("top", element.offsetTop)
			this.entries[i].setAttribute("left", element.offsetLeft)
			this.entries[i].setAttribute("hiddenValue", this.expectedValues[i])	
			this.entries[i].setAttribute("masterEntry", isMaster)
			this.entries[i].setAttribute("predictionSpanId", predspanid)
			this.entries[i].setAttribute("entryIdx", i)
			this.entries[i].setAttribute("bestPredDist", this.expectedValues[i].length * 100 )
			document.getElementById(predspanid).appendChild( document.createElement("span") )
		}

	}


	unhide(){
		for(const span of this.spans){
			if(span.children.length > 0 ){
				let entry = span.children[0]
				span.innerHTML = entry.getAttribute("hiddenValue") 
				if(span.innerHTML != span.parentNode.lastChild.innerHTML){
					span.innerHTML += " "
				}
			}
		}
	}

	hide(){
		this.element.innerHTML = ''
		this.spans = new Array(this.entries.length)
		for(let i = 0; i < this.entries.length; i++){
			let entry = this.entries[i]
			let span = document.createElement("span")
			this.element.appendChild(span)
			span.appendChild(entry)
			this.spans[i] = span
			span.addEventListener('keydown', function(event){ 
				if (event.key === 'Enter') {
					let entry = event.target
					let span = entry.parentNode
					let obtainedValue = entry.value
					if(entry.getAttribute("hiddenValue").toLowerCase() != obtainedValue.toLowerCase() ){
						let dist = levenshtein( entry.getAttribute("hiddenValue").toLowerCase(), obtainedValue.toLowerCase() )
						let predspan = document.getElementById(entry.getAttribute("predictionSpanId")) 
						if(dist < entry.getAttribute("bestPredDist")){
							let entryidx = entry.getAttribute("entryIdx")
							predspan.children[i].innerHTML = obtainedValue
							let predcolor = "red"
							if(dist < (entry.getAttribute("hiddenValue").length / 2)){
								predcolor = "orange"
							}
							if(dist < (entry.getAttribute("hiddenValue").length / 4)){
								predcolor = "gold"
							}
							predspan.children[i].style.color = predcolor
							entry.setAttribute("bestPredDist", dist)
						}
						entry.value = ""

					}
					else
					{
						span.innerHTML = entry.getAttribute("hiddenValue") 
						if(span.innerHTML != span.parentNode.lastChild.innerHTML){
							span.innerHTML += " "
						}

						let predspan = document.getElementById(entry.getAttribute("predictionSpanId")) 
						let entryidx = entry.getAttribute("entryIdx")
						predspan.children[i].innerHTML = entry.getAttribute("hiddenValue")
						predspan.children[i].style.color = "green"
						entry.setAttribute("bestPredDist", 0)

						let isMaster = (entry.getAttribute("masterEntry") === "true")
						if(isMaster){
							yet_to_uncover -= 1
							if(yet_to_uncover <= 0){
								unhide_all_guessables()
							}	
						}
					}			
				} 
			})
		}

	}

}


function hide_all_guessables(){
	yet_to_uncover = 0

	guessable_elements = document.querySelectorAll(".hideable.guessable")

	guessables = new Array(guessable_elements.length)

	for(let i = 0; i < guessable_elements.length; i++){
		g = new Guessable(guessable_elements[i])
		g.hide()
		guessables[i] = g
	}
}

function unhide_all_guessables(){
	for(const g of guessables){
		g.unhide()
	}
}

document.getElementById("reveal-button").addEventListener("click", unhide_all_guessables)