class Typer{
    constructor(){
        this.name = "Anonüümne"; //kasutaja nimi, mida ta peab mängu alguses sisestam
        this.wordsInGame = 3; //mitu sõna peab trükkima, et mäng lõppeks
        this.wordsTyped = 0; //mitu sõna on trükitud
        this.startingWordLength = 3; //esimese sõna pikkus
        this.words = []; //need sõnad, mis tulevad lemmade failist
        this.typeWords = []; //need sõnad, mida hakkame trükkima
        this.word = "aabits"; //sõna, mida peab trükkima
        this.startTime = 0; //mängu algusaeg
        this.endTime = 0; // mängu lõpuaeg
        this.results = [];
        this.chars = 0;

        this.loadFromFile();
    }

    loadFromFile(){
        $.get("lemmad2013.txt", (data) => this.getWords(data));

        $.get("database.txt", (data)=>{
            let content = JSON.parse(data).content;
            this.results = content;
            console.log(this.results);
        })
    }

    getWords(data){
        //console.log(data);
        const dataFromFile = data.split('\n');
        this.separateWordsByLength(dataFromFile);
    }

    separateWordsByLength(data){
        for(let i = 0; i < data.length; i++){
            const wordLength = data[i].length;

            if(this.words[wordLength] === undefined){
                this.words[wordLength] = [];
            }

            this.words[wordLength].push(data[i]);
        }

        console.log(this.words)

        //console.log(this.words);
        $('#submitName').click(
            ()=>{
                this.name = $('#nameValue').val();
                this.startingWordLength = parseFloat($('#startingWordLength').val());
                this.wordsInGame = parseFloat($('#wordsInGame').val());
                if(this.startingWordLength+this.wordsInGame > 31){
                    $('#error').show();
                } else {
                    $('#name').hide();
                    this.startTyper();
                    this.startOnce();
                }

            }
        );
		
		$('#resultsButton').click(() => {
			console.log("Button clicked");
			this.toggleResults();
		});
    }

    startOnce(){
        $(document).on("keypress", (event)=>this.shortenWord(event.key));
        $('#restart').on('click', ()=>this.startTyper());
		$('#resultButton').on('click', () => {$("#myModal").css("display", "block");});
        $('.close').on('click', () => {$("#myModal").css("display", "none");});
        this.updateResults();
    }

    startTyper(){
        $('#restart, #score, #description').hide();
		$('#nextWordDiv').show();
		$('#container').removeClass();
        this.wordsTyped = 0;
        this.generateWords();
        this.updateInfo();
        this.startTime = performance.now();
        console.log(this.startingWordLength);
    }

    updateInfo(){
        $('#gameinfo').html((this.wordsTyped + 1) + ". sõna " + this.wordsInGame + "-st");
    }

    shortenWord(keypressed){
        //console.log(keypressed);

        if(this.word.charAt(0) != keypressed){
            document.getElementById('container').style.backgroundColor = "lightpink";
            setTimeout(function(){
                document.getElementById('container').style.backgroundColor = "green";
            }, 100);
        }

        if(this.word.length > 1 && this.word.charAt(0) == keypressed){
            this.word = this.word.slice(1);
            this.drawWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped != this.wordsInGame - 1){
            this.wordsTyped++;
            this.selectWord();
        } else if(this.word.length == 1 && this.word.charAt(0) == keypressed && this.wordsTyped == this.wordsInGame - 1){
            this.endTime = performance.now();
            this.word = this.word.slice(1);
            this.drawWord();
			$('#nextWordDiv').hide();
            $('#score').html(this.name + ", sinu aeg oli: " + ((this.endTime-this.startTime)/1000).toFixed(2) + " sekundit.");
            this.saveResults();
			//background image
			let charPerMin = ((this.chars/((this.endTime-this.startTime)/1000)) * 60).toFixed(0)
			if (charPerMin < 160){
				$('#description').html("Oled aeglane kirjutaja");
				$('#container').addClass('background-slow');
			}
			else if (charPerMin < 200){
				$('#description').html("Oled keskmise trükkimise kiirusega");
				$('#container').addClass('background-average');
			}
			else if (charPerMin < 250){
				$('#description').html("Oled kiirem kui keskmine inimene!");
				$('#container').addClass('background-fast');
			}
			else if (charPerMin < 300){
				$('#description').html("Oled produktiivse kirjutames kiirusega!");
				$('#container').addClass('background-productive');
			}
			else if (charPerMin < 350){
				$('#description').html("Oled kiire kirjutaja!!");
				$('#container').addClass('background-very-fast');
			}
			else {
				$('#description').html("Oled professionaalne kirjutaja!!");
				$('#container').addClass('background-professional');
			}
			$('#restart, #score, #description').show();
        }
    }



    generateWords(){
        for(let i = 0; i < this.wordsInGame; i++){
            const wordLength = this.startingWordLength + 1 + i;
            const randomWord = Math.round(Math.random() * 
            this.words[wordLength].length);
            //console.log(wordLength, randomWord);

            this.typeWords[i] = this.words[wordLength][randomWord];
        }
        console.log(this.typeWords);
		this.typeWords = this.typeWords.map(element => element.replace(/\r/g, ''));
        this.selectWord();
    }

    selectWord(){
        this.word = this.typeWords[this.wordsTyped];
		this.nextWord = this.typeWords[this.wordsTyped + 1];
        this.drawWord();
    }

    drawWord(){
		$('#wordDiv').html(this.word);
		if (typeof this.nextWord !== 'undefined'){
			$('#nextWordDiv').html(this.nextWord);
		} else {
			$('#nextWordDiv').html("Viimane sõna");
		}
		this.updateInfo();
	}

    saveResults(){
        this.chars = 0;
        for(let i = 0; i < this.wordsInGame; i++){
            this.chars = this.chars + this.startingWordLength + i;
            console.log(this.chars);
        }
        
        let wordsPerMinute = ((this.chars/((this.endTime-this.startTime)/1000)) * 60).toFixed(0);
        console.log(wordsPerMinute);


        let result = {
            name: this.name,
            time: ((this.endTime-this.startTime)/1000).toFixed(2),
            words: this.wordsInGame,
            chars: this.chars,
            wordsPerMin: wordsPerMinute
        }

        this.results.push(result);

        this.results.sort((a, b) => parseFloat(b.wordsPerMin) - parseFloat(a.wordsPerMin));

        this.updateResults();

        $.post('server.php', {save: this.results}).done(
            function(){
                console.log("Success");
            }
        );
    }

	
	
	updateResults(){
        $('#modal-results').html("");
        const table = $("<table class='result-table'></table>"); 
        const headerRow = $("<tr></tr>");
        headerRow.append("<th>Number</th>");
        headerRow.append("<th>Nimi</th>");
        headerRow.append("<th>Aeg</th>");
        headerRow.append("<th>Sõnu</th>");
        headerRow.append("<th>Tähti</th>");
        headerRow.append("<th>Tähemärke minutis</th>");
        table.append(headerRow);

        for (let i = 0; i < this.results.length && i < 10; i++) {
            const result = this.results[i];
            const row = $("<tr></tr>");
            row.append("<td>" + (i + 1) + "</td>");
            row.append("<td>" + result.name + "</td>");
            row.append("<td>" + result.time + "</td>");
            row.append("<td>" + result.words + "</td>");
            row.append("<td>" + result.chars + "</td>");
            row.append("<td>" + result.wordsPerMin + "</td>");
            table.append(row);
        }
		
		$("#modal-results").append(table);
	}

}


let typer = new Typer();