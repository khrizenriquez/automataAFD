//Randi Guarcas 
'use strict';

document.addEventListener("DOMContentLoaded", function () {
	subiendoImagen("boton", "btnProceso");
});

var datos = "";
var pilaTransiciones = "";
var pilaEstado = "";
var tablaTemp = [];
var tablaTrans = [];
var estados = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

//		Haciendo que el input de subir imagen se vea decente
function subiendoImagen (idFile, idBoton) {
    var wrapper = $("<div style='height: 0; width: 0; overflow: hidden;'><div>");
    var fileImagen = $("#" + idFile).wrap(wrapper);

    //todos los evento que tenga se los quito
    $("#" + idBoton).off("click");

    //agrego el evento click para que lo escuche el elemento
    $("#" + idBoton).on("click", function(event, objetct) {
        fileImagen.click();
    }).show();
}

function loadAutomata(f) {
	var reader = new FileReader();  
	reader.readAsText(f);      
	reader.onload = function() { 

		var file_text = reader.result;
		datos = file_text.split("\n"); 
		
		pilaTransiciones = getTransiciones(datos[4].toString());
		pilaEstado = getEstados(datos[0].toString());
		var pilaAlfabeto = getEstados(datos[1].toString());
		var g = 1;
		var pilaMueve = [pilaEstado[0]];
		var T = transicionLambda(pilaMueve);
		
		tablaTemp = [null,estados[0],null,null,T];
		tablaTrans = [tablaTemp];

		for(var mi=0;mi<tablaTrans.length;mi++){
			while(tablaTrans[mi][0] == null){
				tablaTrans[mi][0] = 0;//marcado
				for(var x in pilaAlfabeto) {
					if(g<15){
						var U = transicionLambda(mueveEstado(tablaTrans[mi][1],x));
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
		for(var alf=0;alf<pilaAlfabeto.length;alf++){
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
	var cadenaLimpia = quitarPuntoEstadoLlave(aceptacion);
	var estadosAceptacion = new Array();
	var estados = "{  ";
	var tokensAceptacion = cadenaLimpia.split(",");
	for(var acepta in tokensAceptacion){
		for(var y=0;y<tablaTrans.length;y++){
			var comp = tablaTrans[y][4];
			for(var r=0;r<comp.length;r++){
				if(acepta == comp[r]){
					estadosAceptacion.push(tablaTrans[y][1]);
				}
				//console.log("buscar "+ acepta + " en " + tablaTrans[y][4] + "con " + comp[r]);
			}
			//
		}
	}
	var estadosTrans = estadosAceptacion.unique().sort();
	
	for(var y=0;y<estadosTrans.length;y++){
		estados += estadosTrans[y]+"  ";
	}
	estados += "}"
	return estados;
}

function getEstadosTablaTransiciones(){
	var estados = "{ ";
	for(var y=0;y<tablaTrans.length;y++){
		estados += tablaTrans[y][1] + "  ";
	}
	estados += "}";
	return estados;
}
 
function getEstadoComposicion(composicion,tabla){
	var encontrado = false;
	for(var y=0;y<tabla.length;y++){
		comp = tabla[y][4];
		if(comp==composicion){
			encontrado = tabla[y][1];
		}
	}
	return encontrado;
}
function getHTMLtabla(tablaTrans){
	var tablaHTML = "<table class='tablaTransD'>";
	tablaHTML += "<thead class='head'><tr><th>ESTADO</th><th>a</th><th>b</th><th>COMPOSICIÓN</th></tr></thead>";
	for (var i=0;i<tablaTrans.length;i++){
		tablaHTML += "<tr>";
	    for (var j=1;j<tablaTrans[i].length;j++){
		
		tablaHTML +="<td class='cols'>" + tablaTrans[i][j] + "</td>";
	    }
	tablaHTML += "</tr>";
	}
	tablaHTML += "</table>";

	return tablaHTML;
}

function appendTablaTrans(composicion, tabla){
	var encontrado = false;
	for(var y=0;y<tabla.length;y++){
		var comp = tabla[y][4];
		if(comp==composicion){
			encontrado = true;
		}
	}
	return encontrado;
}

function buscarTrans(composicion){
	var nuevo = 0;
	var contador = 1;
	console.log(composicion);
	for(var y=0;y<tablaTrans.length;y++){
		if(tablaTrans[y][4]==composicion){
			console.log("encontrado en:" + tablaTrans[y][1]);
		}else{
			nuevo = 1;
		}
		
	}
	return nuevo;
}

function mueveEstado(estado,elementoAlfabeto){
	var apilar = [];
	var pilaMueve = [];
	//console.log("mueve("+estado+","+elementoAlfabeto+")");
	
	for(var n=0;n<tablaTrans.length;n++){
		var estadoTabla = tablaTrans[n][1];
		if(estadoTabla == estado){
			var compocisionTabla = tablaTrans[n][4];
			for(var elemento in compocisionTabla){
				apilar.push(elemento);
			}	
		}
	}
	
	for(var mueve in apilar) {
		for (var transicion in pilaTransiciones) {
		var transicionUnique = transicion;
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
	var estadosLambda = "";
	var pilaLambda = [];
	var retornarPila = 0;

	for(var mueve in pilaMueve) {
		if(mueve!="0"){
			for (var transicion in pilaTransiciones) {
				var transicionUnique = transicion;
				if(transicionUnique[0]==mueve){
					if(transicionUnique[1]=="e"){
						pilaLambda.push(transicionUnique[2]);
					}
				}	
			}
			
		}
	}

	if(pilaLambda.length > 0){
		for(var mueve in pilaLambda){
			for (var transicion in pilaTransiciones) {
			transicionUnique = transicion;
				if(transicionUnique[0]==mueve){
					if(transicionUnique[1]=="e"){
						pilaLambda.push(transicionUnique[2]);
					}
				}	
			}
		}
		for(var m in pilaMueve){
			pilaLambda.push(m);
		}		
	
	}else{
		pilaLambda = pilaMueve;	
	}
	
	var pilaLimpia = pilaLambda.unique().sort();
	for(var ch in pilaLimpia) {
		estadosLambda += ch;
	}
	//console.log("{"+estadosLambda+"}");
	return estadosLambda;	
}

Array.prototype.unique=function(a){
  return function(){return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});

function getAlfabeto(estadosCadena){
	var cadenaLimpia = quitarPuntoEstadoLlave(estadosCadena);
	var estadosTokens = cadenaLimpia.split(",");
	var pilaAlfabeto = [];
	for(var i=0;i<estadosTokens.length;i++){
		pilaAlbafeto.push(estadosTokens[i]);
	}
	return pilaAlfabeto;
}


function getEstados(estadosCadena){
	var cadenaLimpia = quitarPuntoEstadoLlave(estadosCadena);
	var estadosTokens = cadenaLimpia.split(",");
	var pilaEstados = [];
	for(var i=0;i<estadosTokens.length;i++){
		pilaEstados.push(estadosTokens[i]);
	}
	return pilaEstados;
}


function getTransiciones(estadosCadena){
	var cadenaLimpia = quitarPuntoEstadoLlave(estadosCadena);
	var apilar ="";
	var pilaTransiciones = [];	
	for(var i = 0; i < cadenaLimpia.length; i++){
		var ch = cadenaLimpia[i];
		if(ch!=','){
			if(ch=='('){
				ch = ch.replace("(", "|");
			}
			if(ch==')'){
				ch = ch.replace(")", "|");
			}
			apilar+=ch;
		}
	}
	
	var trans =	apilar.split("|");
	for(var i=0;i<trans.length;i++){
		if(trans[i]!=''){
			pilaTransiciones.push(trans[i]);
		}
	}
	
	return pilaTransiciones;
}

function quitarPuntoEstadoLlave(cadena){
	var cadenaLimpia = "";
	var post = cadena.split(":");
	var pre = post[1].split("{");
	var ini = pre[1].split("}");
	for(var i = 0; i < ini.length; i++){
		cadenaLimpia += ini[i];
	}	
	return cadenaLimpia;
}
