// Format energy f kcal properly
//   NaN    => "NaN"
//   12.34  => "12.34"
//   12.345 => "12.35" (rounding)
//   12.1   => "12.10" (right-pad zeros)
//   12     => "12.00" (right-pad zeros (and point))
function enformat(f) {
  var s = "" + (Math.round(f * 100.0) / 100.0);
  if (s==="NaN") {
    // do nothing
  }
  else if (s.search("[.][0-9]$") != -1) {
    s += "0";
  }
  else if (s.search("[.]") == -1) {
    s += ".00";
  }
  return s;
}

// Format parameter f properly (for safe URL)
// String representation of f must be "#", "#.#", or ".#"
// where "#" is digits of any length.
function num(f) {
        var s = "" + f;
        if (s.search("^([0-9]*[.])?[0-9]+$") == 0) {
          return s;
        }
        return "";
}

// Read parameters from the form and calculate energy consumption.
function update() {
	var sbw, scw, stm, shd, sud, sdd;
	sbw = document.f.bweight.value;
	scw = document.f.cweight.value;
	stm = document.f.time.value;
	shd = document.f.hdist.value;
	sud = document.f.udist.value;
	sdd = document.f.ddist.value;
	
	var ibw, fcw, itm, ihd, fud, fdd;
	var err = 0;
	try {
	  fbw = parseFloat(sbw);
	  fcw = parseFloat(scw);
	  ftm = parseFloat(stm);
	  fhd = parseFloat(shd);
	  fud = parseFloat(sud);
	  fdd = parseFloat(sdd);
	} catch (ex) {
	  err = 1;
	}

	var fw = (fbw + fcw);
	var fa = (1.8 * ftm / 60.0 + 0.3 * fhd + 10.0 * fud / 1000.0 + 0.6 * fdd / 1000.0);
	f.energy.value = enformat( fw * fa );
	f.en_tm .value = enformat( fw * ( 1.8 * ftm / 60.0) );
	f.en_hd .value = enformat( fw * ( 0.3 * fhd) );
	f.en_ud .value = enformat( fw * (10.0 * fud / 1000.0) );
	f.en_dd .value = enformat( fw * ( 0.6 * fdd / 1000.0) );
	f.en_bw .value = enformat( fbw * fa );
	f.en_cw .value = enformat( fcw * fa );

	// Create link
        var lk = "";
	var addlk = function(name, value) {
	  if (!(value>0)) return;
	  if (lk.length == 0) {
	    lk += "#";
	  } else {
	    lk += "&";
	  }
	  lk += name + "=" + num(value);
	};
        addlk("bw", fbw);
        addlk("cw", fcw);
        addlk("tm", ftm);
        addlk("hd", fhd);
        addlk("ud", fud);
        addlk("dd", fdd);
        var elem = document.getElementById("lk");
        elem.href = lk;

	var chglang = document.getElementById("chglang");
	chglang.href = chglang.href.split("#")[0] + lk;
        //elem.innerText = (lk==="") ? "." : lk;
	// ikymrkw
}

function condfocus(control) {
  if (!control.value || control.value.length==0 || (0+control.value)==0) {
    control.select(); control.focus();
    return true;
  }
  return false;
}

function initControls(hashOnly) {
        // Read initial values from query
        var fbw=0, fcw=0, ftm=0, fhd=0, fdd=0, fud=0;
        var parse = function(h) {
          if (h==null || h==="") {} else {
            h = h.substring(1); // to strip the first '?' 
            var hs = h.split("&");
            for (var i=0; i<hs.length; i++) {
              var nvp = hs[i].split("=");
              if (nvp[0]==="bw") {
                fbw = nvp[1];
              }
              if (nvp[0]==="cw") {
                fcw = nvp[1];
              }
              if (nvp[0]==="tm") {
                ftm = nvp[1];
              }
              if (nvp[0]==="hd") {
                fhd = nvp[1];
              }
              if (nvp[0]==="ud") {
                fud = nvp[1];
              }
              if (nvp[0]==="dd") {
                fdd = nvp[1];
              }
            }
          }
        };
        if (!hashOnly) parse(window.location.search);
	parse(window.location.hash);
	
	// Initialized controls (event handlers and ini-values)
	var fevt = function(elem) {
          if (!hashOnly) {
            elem.onchange = update;
            elem.onkeyup = update;
          }
        };
	var e;
	e = document.getElementById("bweight");
        e.value = fbw;
	fevt(e);
	e = document.getElementById("cweight");
        e.value = fcw;
	fevt(e);
	e = document.getElementById("time");
        e.value = ftm;
	fevt(e);
	e = document.getElementById("hdist");
        e.value = fhd;
	fevt(e);
	e = document.getElementById("udist");
        e.value = fud;
	fevt(e);
	e = document.getElementById("ddist");
        e.value = fdd;
	fevt(e);

	// default focus
	if (!condfocus(document.f.bweight)) {
	  if (!condfocus(document.f.cweight)) {
	    if (!condfocus(document.f.time)) {
	      if (!condfocus(document.f.hdist)) {
	        if (!condfocus(document.f.udist)) {
	          if (!condfocus(document.f.ddist)) {
	            document.f.time.focus();
	          }
	        }
	      }
	    }
	  }
	}
}

// This function does 3 things:
//   - read initial values from URL query parameters (if any),
//   - add event handlers (update) and ini-values to the form, and
//   - the first update (reflect initial parameters to energy)
function setup() {
        initControls(false);

        // monitor hash
        window.onhashchange = function() { initControls(true); update(); };

        // first calculation
        update();
}
