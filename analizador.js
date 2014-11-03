//Randi Guarcas 
var datos = "";
var pilaTransiciones = "";
var pilaEstado = "";
var tablaTemp = new Array();
var tablaTrans = new Array();
var estados = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

function loadAutomata(f) {
	var reader = new FileReader();  
	reader.readAsText(f);      
	reader.onload = function() { 

		file_text = reader.result;
		datos = file_text.split("\n"); 
		
		pilaTransiciones = getTransiciones(datos[4].toString());
		pilaEstado = getEstados(datos[0].toString());
		pilaAlfabeto = getEstados(datos[1].toString());
		g = 1;
		pilaMueve = [pilaEstado[0]];
		T = transicionLambda(pilaMueve);
		
		tablaTemp = [null,estados[0],null,null,T];
		tablaTrans = [tablaTemp];

		for(mi=0;mi<tablaTrans.length;mi++){
			while(tablaTrans[mi][0] == null){
				tablaTrans[mi][0] = 0;//marcado
				for(x of pilaAlfabeto){
					if(g<15){
						U = transicionLambda(mueveEstado(tablaTrans[mi][1],x));
							if(!appendTablaTrans(U,tablaTrans)){
								tablaTemp = [null,estados[g],null,null,U];
								tablaTrans.push(tablaTemp)
								if(x=='a'){
									tablaTrans[mi][2] = estados[g];
								}
								if(x=='b'){
									tablaTrans[mi][3] = estados[g];
								}
								g++;
							}else{
								if(x=="a"){
									tablaTrans[mi][2]=getEstadoComposicion(U,tablaTrans);	
								}
								else if(x=="b"){
									tablaTrans[mi][3]=getEstadoComposicion(U,tablaTrans);	
								}
							}
					}
				}
			}
		}
		
		//tabla de transiciones
		var div = document.getElementById('respuesta');
		div.innerHTML = getHTMLtabla(tablaTrans);
		
		//alfabeto
		var alfabeto = "{";
		for(alf=0;alf<pilaAlfabeto.length;alf++){
			alfabeto += pilaAlfabeto[alf] + "  "
		}
		alfabeto +=" }"
		var divs = document.getElementById('alfabetoResp');
		divs.innerHTML = alfabeto;
		
		//estados
		var divEstados = document.getElementById('estadosResp');
		divEstados.innerHTML = getEstadosTablaTransiciones();
		
		//estadosEstados de Aceptacion
		var divEstadosAceptacion = document.getElementById('estadosAceptaResp');
		divEstadosAceptacion.innerHTML = getEstadosDeAceptacion(datos[3].toString());
	}//fin readonload

}

function getEstadosDeAceptacion(aceptacion){
cadenaLimpia = quitarPuntoEstadoLlave(aceptacion);
estadosAceptacion = new Array();
estados = "{  ";
tokensAceptacion = cadenaLimpia.split(",");
	for(acepta of tokensAceptacion){
		for(y=0;y<tablaTrans.length;y++){
			comp = tablaTrans[y][4];
			for(r=0;r<comp.length;r++){
				if(acepta == comp[r]){
					estadosAceptacion.push(tablaTrans[y][1]);
				}
				//console.log("buscar "+ acepta + " en " + tablaTrans[y][4] + "con " + comp[r]);
			}
			//
		}
	}
	estadosTrans = estadosAceptacion.unique().sort();
	
	for(y=0;y<estadosTrans.length;y++){
		estados += estadosTrans[y]+"  ";
	}
	estados += "}"
	return estados;
}

function getEstadosTablaTransiciones(){
estados = "{ ";
	for(y=0;y<tablaTrans.length;y++){
		estados += tablaTrans[y][1] + "  ";
	}
estados += "}";
return estados;
}
 
function getEstadoComposicion(composicion,tabla){
encontrado = false;
	for(y=0;y<tabla.length;y++){
		comp = tabla[y][4];
		if(comp==composicion){
			encontrado = tabla[y][1];
		}
	}
return encontrado;
}
function getHTMLtabla(tablaTrans){
tablaHTML = "<table class='tablaTransD'>";
tablaHTML += "<thead class='head'><tr><th>ESTADO</th><th>a</th><th>b</th><th>COMPOSICIÓN</th></tr></thead>";
for (i=0;i<tablaTrans.length;i++){
	tablaHTML += "<tr>";
    for (j=1;j<tablaTrans[i].length;j++){
	
	tablaHTML +="<td class='cols'>" + tablaTrans[i][j] + "</td>";
    }
tablaHTML += "</tr>";
}
tablaHTML += "</table>";

return tablaHTML;
}

function appendTablaTrans(composicion, tabla){
encontrado = false;
	for(y=0;y<tabla.length;y++){
		comp = tabla[y][4];
		if(comp==composicion){
			encontrado = true;
		}
	}
return encontrado;
}

function buscarTrans(composicion){
nuevo = 0;
contador = 1;
	console.log(composicion);
	for(y=0;y<tablaTrans.length;y++){
		if(tablaTrans[y][4]==composicion){
			console.log("encontrado en:" + tablaTrans[y][1]);
		}else{
			nuevo = 1;
		}
		
	}
return nuevo;
}

function mueveEstado(estado,elementoAlfabeto){
var apilar = new Array();
var pilaMueve = new Array();
	//console.log("mueve("+estado+","+elementoAlfabeto+")");
	
	for(n=0;n<tablaTrans.length;n++){
		estadoTabla = tablaTrans[n][1];
		if(estadoTabla == estado){
			compocisionTabla = tablaTrans[n][4];
			for(elemento of compocisionTabla){
				apilar.push(elemento);
			}	
		}
	}
	
	for(mueve of apilar){
		for (transicion of pilaTransiciones) {
		transicionUnique = transicion;
			if(transicionUnique[1] == elementoAlfabeto){
				if(transicionUnique[0]==mueve){
					pilaMueve.push(transicionUnique[2]);
				}
			}
		}
	}

	if(pilaMueve==''){
		pilaMueve.push("0");
	}
	//console.log(pilaMueve);
	return pilaMueve;
		
}

function transicionLambda(pilaMueve){
estadosLambda = "";
pilaLambda=new Array();
retornarPila = 0;

	for(mueve of pilaMueve){
		if(mueve!="0"){
			for (transicion of pilaTransiciones) {
				transicionUnique = transicion;
				if(transicionUnique[0]==mueve){
					if(transicionUnique[1]=="e"){
						pilaLambda.push(transicionUnique[2]);
					}
				}	
			}
			
		}
	}

	if(pilaLambda.length > 0){
		for(mueve of pilaLambda){
			for (transicion of pilaTransiciones) {
			transicionUnique = transicion;
				if(transicionUnique[0]==mueve){
					if(transicionUnique[1]=="e"){
						pilaLambda.push(transicionUnique[2]);
					}
				}	
			}
		}
		for(m of pilaMueve){
			pilaLambda.push(m);
		}		
	
	}else{
		pilaLambda = pilaMueve;	
	}
	
	pilaLimpia = pilaLambda.unique().sort();
	for(char of pilaLimpia){
		estadosLambda +=char;
	}
	//console.log("{"+estadosLambda+"}");
	return estadosLambda;	
}

Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});

function getAlfabeto(estadosCadena){
	cadenaLimpia = quitarPuntoEstadoLlave(estadosCadena);
	estadosTokens = cadenaLimpia.split(",");
	pilaAlfabeto = new Array();
	for(i=0;i<estadosTokens.length;i++){
		pilaAlbafeto.push(estadosTokens[i]);
	}
	return pilaAlfabeto;
}


function getEstados(estadosCadena){
	cadenaLimpia = quitarPuntoEstadoLlave(estadosCadena);
	estadosTokens = cadenaLimpia.split(",");
	pilaEstados = new Array();
	for(i=0;i<estadosTokens.length;i++){
		pilaEstados.push(estadosTokens[i]);
	}
	return pilaEstados;
}


function getTransiciones(estadosCadena){
	cadenaLimpia = quitarPuntoEstadoLlave(estadosCadena);
	apilar ="";
	pilaTransiciones = new Array();	
	for(i = 0; i < cadenaLimpia.length; i++){
		char = cadenaLimpia[i];
		if(char!=','){
			if(char=='('){
				char = char.replace("(", "|");
			}
			if(char==')'){
				char = char.replace(")", "|");
			}
			apilar+=char;
		}
	}
	
	trans =	apilar.split("|");
	for(i=0;i<trans.length;i++){
		if(trans[i]!=''){
			pilaTransiciones.push(trans[i]);
		}
	}
	
	return pilaTransiciones;
}

function quitarPuntoEstadoLlave(cadena){
	cadenaLimpia = "";
		post = cadena.split(":");
		pre = post[1].split("{");
		ini = pre[1].split("}");
	for(i = 0; i < ini.length; i++){
		cadenaLimpia += ini[i];
	}	
	return cadenaLimpia;
}
