(function () {
  const SUPABASE_URL = "TU_SUPABASE_URL";
  const SUPABASE_ANON_KEY = "TU_SUPABASE_ANON_KEY";
  const TABLA_KV = "tecnomat_kv";
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyDIsRvCzSJeQ0ftK9DhMl8SAVPBlx9IKEc",
    authDomain: "almacenamiento-datos-40e38.firebaseapp.com",
    projectId: "almacenamiento-datos-40e38",
    storageBucket: "almacenamiento-datos-40e38.firebasestorage.app",
    messagingSenderId: "901796174695",
    appId: "1:901796174695:web:767991d98b3383c186edc2"
  };
  const COLECCION_FIRESTORE = "tecnomat_materiales";
  const __GEMINI_PROXY_URL = "https://script.google.com/macros/s/AKfycbyVLtCqT_TvqFdT16JCbBARBl1dMKCKmWHvZQaZOx7sYz2SUCop5x7wXpzL2JK5jmJh/exec";
  let supabaseCliente = null;
  let firestore = null;
  let firebaseAuth = null;
  try {
    if (SUPABASE_URL && SUPABASE_URL !== "TU_SUPABASE_URL" && typeof window.supabase !== "undefined") {
      supabaseCliente = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
  } catch (_0x65916d) {
    supabaseCliente = null;
  }
  try {
    if (FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "TU_API_KEY" && typeof firebase !== "undefined") {
      firebase.initializeApp(FIREBASE_CONFIG);
      firestore = firebase.firestore();
      firebaseAuth = firebase.auth();
    }
  } catch (_0x522d9f) {
    firestore = null;
    firebaseAuth = null;
  }
  let backend = null;
  if (supabaseCliente || firestore) {
    backend = {
      async get(_0x63645) {
        if (supabaseCliente) {
          try {
            const {
              data: _0x39cecb,
              error: _0xbb65ea
            } = await supabaseCliente.from(TABLA_KV).select("value").eq("key", _0x63645).maybeSingle();
            if (_0xbb65ea) {
              throw _0xbb65ea;
            }
            if (_0x39cecb) {
              return _0x39cecb.value;
            }
          } catch (_0x45ab88) {}
        }
        if (firestore) {
          const _0x29cbdf = await firestore.collection(COLECCION_FIRESTORE).doc(_0x63645).get();
          if (_0x29cbdf.exists) {
            return _0x29cbdf.data().value;
          } else {
            return null;
          }
        }
        return null;
      },
      async set(_0x714aa, _0x1c103a) {
        const _0x220cf7 = await Promise.allSettled([supabaseCliente ? supabaseCliente.from(TABLA_KV).upsert({
          key: _0x714aa,
          value: _0x1c103a,
          updated_at: new Date().toISOString()
        }) : Promise.resolve(null), firestore ? firestore.collection(COLECCION_FIRESTORE).doc(_0x714aa).set({
          value: _0x1c103a,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        }) : Promise.resolve(null)]);
        if (!_0x220cf7.some(_0x14137e => _0x14137e.status === "fulfilled")) {
          throw _0x220cf7[0].reason || new Error("No se pudo guardar en ningún backend");
        }
        return {
          key: _0x714aa,
          value: _0x1c103a
        };
      },
      async delete(_0x164163) {
        await Promise.allSettled([supabaseCliente ? supabaseCliente.from(TABLA_KV).delete().eq("key", _0x164163) : Promise.resolve(), firestore ? firestore.collection(COLECCION_FIRESTORE).doc(_0x164163).delete() : Promise.resolve()]);
      },
      watch(_0x527498, _0x2ee85c) {
        const _0x17fd34 = [];
        if (supabaseCliente) {
          const _0x28c647 = supabaseCliente.channel("kv-" + _0x527498).on("postgres_changes", {
            event: "*",
            schema: "public",
            table: TABLA_KV,
            filter: "key=eq." + _0x527498
          }, _0x5489d4 => {
            if (_0x5489d4.new && _0x5489d4.new.value !== undefined) {
              _0x2ee85c(_0x5489d4.new.value);
            }
          }).subscribe();
          _0x17fd34.push(() => supabaseCliente.removeChannel(_0x28c647));
        }
        if (firestore) {
          const _0x2df005 = firestore.collection(COLECCION_FIRESTORE).doc(_0x527498).onSnapshot(_0x3d9c1d => {
            if (_0x3d9c1d.exists) {
              _0x2ee85c(_0x3d9c1d.data().value);
            }
          }, () => {});
          _0x17fd34.push(_0x2df005);
        }
        return () => _0x17fd34.forEach(_0x1163f7 => _0x1163f7());
      },
      async adjustStockAtomic(_0x2c7b83, _0x295d01) {
        if (supabaseCliente) {
          const {
            error: _0x49a948
          } = await supabaseCliente.rpc("ajustar_stock", {
            clave: "catalog",
            item_id: _0x2c7b83.id,
            delta: _0x295d01,
            item_nuevo: _0x2c7b83
          });
          if (_0x49a948) {
            throw _0x49a948;
          }
          if (firestore) {
            try {
              const {
                data: _0x33defc
              } = await supabaseCliente.from(TABLA_KV).select("value").eq("key", "catalog").maybeSingle();
              if (_0x33defc) {
                await firestore.collection(COLECCION_FIRESTORE).doc("catalog").set({
                  value: _0x33defc.value,
                  updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
              }
            } catch (_0x1efb76) {}
          }
          return;
        }
        const _0x274fc4 = firestore.collection(COLECCION_FIRESTORE).doc("catalog");
        await firestore.runTransaction(async _0x9f3282 => {
          const _0x4a36c4 = await _0x9f3282.get(_0x274fc4);
          const _0x5b37bf = _0x4a36c4.exists ? _0x4a36c4.data().value : [];
          const _0x25982b = _0x5b37bf.find(_0x4b5f2b => _0x4b5f2b.id === _0x2c7b83.id);
          if (_0x25982b) {
            _0x25982b.qty += _0x295d01;
          } else {
            _0x5b37bf.push(Object.assign({}, _0x2c7b83));
          }
          _0x9f3282.set(_0x274fc4, {
            value: _0x5b37bf,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
      },
      // Lee el valor actual del servidor, le aplica `fn` y lo guarda, sin que otro dispositivo se cuele en medio.
      // `fn` puede ejecutarse varias veces (reintentos de Firestore): debe ser pura. Sin conexión, la transacción falla.
      async modificar(clave, fn) {
        if (supabaseCliente) {
          // shortcut: con Supabase activo esto es leer-aplicar-escribir, no una transacción; al activarlo, pasar a tablas o RPC
          const valor = fn(await this.get(clave));
          await this.set(clave, valor);
          return valor;
        }
        const ref = firestore.collection(COLECCION_FIRESTORE).doc(clave);
        let valor;
        await firestore.runTransaction(async t => {
          const doc = await t.get(ref);
          valor = fn(doc.exists ? doc.data().value : null);
          t.set(ref, {
            value: valor,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        });
        return valor;
      },
      watchOrdenesTrabajo(_0x4b77fb) {
        if (!supabaseCliente) {
          return;
        }
        return supabaseCliente.channel("ordenes-trabajo").on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "ordenes_trabajo"
        }, _0xfbf1b3 => _0x4b77fb(_0xfbf1b3.new)).subscribe();
      },
      async getMaterialesDeOrden(_0x2e1d76) {
        if (!supabaseCliente) {
          return [];
        }
        const {
          data: _0x30d4b9,
          error: _0x454226
        } = await supabaseCliente.from("orden_materiales").select("*").eq("orden_id", _0x2e1d76);
        if (_0x454226) {
          throw _0x454226;
        }
        return _0x30d4b9 || [];
      },
      // Enlace con la app hermana (supabase_enlace.sql). Sin Supabase configurado devuelven listas vacías.
      async getOrdenesActivas() {
        if (!supabaseCliente) {
          return [];
        }
        const { data, error } = await supabaseCliente.from("ordenes_trabajo").select("*").eq("estado", "activo").order("created_at");
        if (error) {
          throw error;
        }
        return data || [];
      },
      async getEsquemasDeOrden(ordenId) {
        if (!supabaseCliente) {
          return [];
        }
        const { data, error } = await supabaseCliente.from("tecnomat_esquemas").select("nombre, url").eq("orden_id", ordenId).order("created_at");
        if (error) {
          throw error;
        }
        return data || [];
      },
      async getTrabajadoresExternos() {
        if (!supabaseCliente) {
          return [];
        }
        const { data, error } = await supabaseCliente.from("tecnomat_trabajadores").select("id, nombre, puesto, activo").eq("activo", true);
        if (error) {
          throw error;
        }
        return data || [];
      },
      watchMateriales(_0xf601f4) {
        if (!supabaseCliente) {
          return;
        }
        return supabaseCliente.channel("materiales").on("postgres_changes", {
          event: "INSERT",
          schema: "public",
          table: "materiales"
        }, _0x5a2609 => _0xf601f4(_0x5a2609.new)).on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "materiales"
        }, _0x188f49 => _0xf601f4(_0x188f49.new)).subscribe();
      },
      async getMaterialesActuales() {
        if (!supabaseCliente) {
          return [];
        }
        const {
          data: _0x57eac8,
          error: _0x202158
        } = await supabaseCliente.from("materiales").select("*");
        if (_0x202158) {
          throw _0x202158;
        }
        return _0x57eac8 || [];
      },
      watchMaterialesRapidos(_0x44511c) {
        if (!supabaseCliente) {
          return;
        }
        return supabaseCliente.channel("materiales-rapidos").on("postgres_changes", {
          event: "*",
          schema: "public",
          table: "materiales_rapidos"
        }, () => _0x44511c()).subscribe();
      },
      async getMaterialesRapidos() {
        if (!supabaseCliente) {
          return [];
        }
        const {
          data: _0x56494f,
          error: _0x3ccc28
        } = await supabaseCliente.from("materiales_rapidos").select("*").order("orden", {
          ascending: true
        });
        if (_0x3ccc28) {
          throw _0x3ccc28;
        }
        return _0x56494f || [];
      },
      async addMaterialRapido(_0x96eeb3, _0x11da93, _0x435457) {
        if (!supabaseCliente) {
          throw new Error("Esto necesita Supabase configurado");
        }
        const {
          error: _0x1dca1d
        } = await supabaseCliente.from("materiales_rapidos").insert({
          codigo: _0x96eeb3 || null,
          nombre: _0x11da93,
          orden: _0x435457 || 0
        });
        if (_0x1dca1d) {
          throw _0x1dca1d;
        }
      },
      async deleteMaterialRapido(_0x3752ad) {
        if (!supabaseCliente) {
          return;
        }
        const {
          error: _0x4c3a28
        } = await supabaseCliente.from("materiales_rapidos").delete().eq("id", _0x3752ad);
        if (_0x4c3a28) {
          throw _0x4c3a28;
        }
      },
      auth: {
        async signIn(_0x36cc69, _0x14f715) {
          if (!firebaseAuth) {
            throw new Error("Login no disponible: falta configurar Firebase Authentication.");
          }
          const __acceso = await firebaseAuth.signInWithEmailAndPassword(_0x36cc69, _0x14f715);
          if (supabaseCliente) {
            try {
              await supabaseCliente.auth.signInWithPassword({
                email: _0x36cc69,
                password: _0x14f715
              });
            } catch (__e) {}
          }
          return __acceso;
        },
        async signOut() {
          if (supabaseCliente) {
            try {
              await supabaseCliente.auth.signOut();
            } catch (__e) {}
          }
          if (firebaseAuth) {
            await firebaseAuth.signOut();
          }
        },
        onChange(_0x390c8a) {
          if (firebaseAuth) {
            firebaseAuth.onAuthStateChanged(_0x390c8a);
          }
        },
        currentUserEmail() {
          return firebaseAuth && firebaseAuth.currentUser && firebaseAuth.currentUser.email || "";
        }
      }
    };
  }
  const hayBackend = !!backend;
  const _0x309050 = {
    publicKey: "u_V6OyiI7F3r-7nQT",
    serviceId: "service_aen4ibl",
    templateId: "template_mo0wj5v"
  };
  let _0x172e48 = false;
  try {
    if (_0x309050.publicKey !== "TU_PUBLIC_KEY" && typeof emailjs !== "undefined") {
      emailjs.init({
        publicKey: _0x309050.publicKey
      });
      _0x172e48 = true;
    }
  } catch (_0x17a7f7) {
    _0x172e48 = false;
  }
  function enviarCorreoAviso(_0x46928b, _0x3aeb08) {
    if (!_0x172e48 || !estado.settings.emailDestino) {
      return;
    }
    emailjs.send(_0x309050.serviceId, _0x309050.templateId, {
      subject: _0x46928b,
      message: _0x3aeb08,
      to_email: estado.settings.emailDestino
    }).catch(function (_0x27ad4a) {
      _0x279f78("Aviso de pedido: no se pudo enviar el correo — " + (_0x27ad4a && _0x27ad4a.text ? _0x27ad4a.text : _0x27ad4a));
    });
  }
  let _0x1f4699 = new Set();
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
  function _0x1564f0() {
    if (!estado.settings.sonidoEscaneo) {
      return;
    }
    try {
      const _0xd6951 = _0x182dd3();
      if (!_0xd6951) {
        return;
      }
      const _0x1d110f = _0xd6951.createOscillator();
      const _0x55c9bc = _0xd6951.createGain();
      _0x1d110f.type = "sine";
      _0x1d110f.frequency.value = 1400;
      _0x55c9bc.gain.setValueAtTime(0.2, _0xd6951.currentTime);
      _0x55c9bc.gain.exponentialRampToValueAtTime(0.001, _0xd6951.currentTime + 0.08);
      _0x1d110f.connect(_0x55c9bc);
      _0x55c9bc.connect(_0xd6951.destination);
      _0x1d110f.start(_0xd6951.currentTime);
      _0x1d110f.stop(_0xd6951.currentTime + 0.08);
    } catch (_0x572975) {}
  }
  let _0x1fa20a = null;
  function _0x182dd3() {
    if (!_0x1fa20a) {
      try {
        _0x1fa20a = new (window.AudioContext || window.webkitAudioContext)();
      } catch (_0x3aff82) {
        return null;
      }
    }
    if (_0x1fa20a.state === "suspended") {
      _0x1fa20a.resume().catch(() => {});
    }
    return _0x1fa20a;
  }
  ["click", "touchstart", "keydown", "visibilitychange"].forEach(_0x146181 => {
    document.addEventListener(_0x146181, () => {
      _0x182dd3();
    }, {
      passive: true
    });
  });
  function _0x8133c4() {
    try {
      const _0x16234a = _0x182dd3();
      if (!_0x16234a) {
        return;
      }
      [0, 0.18].forEach(_0x25ce40 => {
        const _0x42ee0c = _0x16234a.createOscillator();
        const _0x1f42ba = _0x16234a.createGain();
        _0x42ee0c.type = "sine";
        _0x42ee0c.frequency.value = 880;
        _0x1f42ba.gain.setValueAtTime(0.25, _0x16234a.currentTime + _0x25ce40);
        _0x1f42ba.gain.exponentialRampToValueAtTime(0.001, _0x16234a.currentTime + _0x25ce40 + 0.15);
        _0x42ee0c.connect(_0x1f42ba);
        _0x1f42ba.connect(_0x16234a.destination);
        _0x42ee0c.start(_0x16234a.currentTime + _0x25ce40);
        _0x42ee0c.stop(_0x16234a.currentTime + _0x25ce40 + 0.15);
      });
    } catch (_0x129097) {}
  }
  function _0x4c4050(_0x3c7744) {
    if (!("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    try {
      new Notification((_0x3c7744.para === "taller" ? "Material listo para recoger en " : "Nuevo pedido en ") + _0x3c7744.groupName, {
        body: (_0x3c7744.para === "taller" ? "Pasa por almacén a recogerlo" : "Pedido por " + _0x3c7744.requesterName) + " · " + _0x3c7744.lineas + " línea(s)" + (_0x3c7744.tipo ? " · " + _0x3c7744.tipo : ""),
        tag: _0x3c7744.id
      });
    } catch (_0x1b4811) {}
  }
  function _0x2df77d() {
    if (!hayBackend) {
      return "almacen";
    }
    const _0x589ba4 = backend.auth.currentUserEmail().toLowerCase();
    if (!_0x589ba4) {
      return "almacen";
    }
    if (_0x589ba4 === "taller@tecnomat.es") {
      return "taller";
    }
    return "almacen";
  }
  function usuarioActual() {
    if (hayBackend) {
      return backend.auth.currentUserEmail();
    } else {
      return "";
    }
  }
  function _0x4cacf5(_0x4c84a2) {
    document.getElementById("loginScreen").style.display = "flex";
    document.getElementById("app").style.display = "none";
    const _0x30b162 = document.getElementById("loginError");
    if (_0x30b162) {
      _0x30b162.textContent = _0x4c84a2 || "";
    }
  }
  function _0x5e4b53(_0x500d0f) {
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("app").style.display = "block";
    const _0x18637b = document.getElementById("mainList");
    if (_0x18637b) {
      _0x18637b.innerHTML = "<div class=\"empty-state\">Cargando datos…</div>";
    }
    const _0x28242e = document.getElementById("logoutArea");
    if (_0x28242e) {
      _0x28242e.innerHTML = (_0x500d0f ? "<button class=\"cam-btn\" id=\"logoutBtn\">" + _0x500d0f.email + " · Cerrar sesión</button>" : "") + "<span id=\"temaToggleArea\"></span><span id=\"ayudaBtnArea\"></span>";
      const _0x3c9f14 = document.getElementById("logoutBtn");
      if (_0x3c9f14) {
        _0x3c9f14.addEventListener("click", () => backend.auth.signOut());
      }
      _0x164745();
      _0x32e8d7();
      _0x453aa4();
    }
  }
  function _0x310cbd(_0x30bf32) {
    document.documentElement.classList.toggle("tema-claro", _0x30bf32);
    const _0x40e1fc = document.getElementById("app");
    if (_0x40e1fc) {
      _0x40e1fc.classList.toggle("tema-claro", _0x30bf32);
    }
  }
  function _0x339d44() {
    const _0x4dc20e = !document.documentElement.classList.contains("tema-claro");
    try {
      localStorage.setItem("tecnomat_tema", _0x4dc20e ? "claro" : "oscuro");
    } catch (_0x2bc120) {}
    _0x310cbd(_0x4dc20e);
    _0x164745();
  }
  function _0x164745() {
    const _0x4b8006 = document.getElementById("temaToggleArea");
    if (!_0x4b8006) {
      return;
    }
    const _0x436fc9 = document.documentElement.classList.contains("tema-claro");
    _0x4b8006.innerHTML = "<button class=\"cam-btn\" id=\"temaToggleBtn\">" + (_0x436fc9 ? "Modo oscuro" : "Modo claro") + "</button>";
    document.getElementById("temaToggleBtn").addEventListener("click", _0x339d44);
  }
  try {
    if (localStorage.getItem("tecnomat_tema") === "claro") {
      _0x310cbd(true);
    }
  } catch (_0x24047a) {}
  function __pasosAyuda() {
    const __esTaller = _0x2df77d() === "taller";
    return [{
      titulo: "Bienvenido a Tecnomat",
      texto: __esTaller ? "Esta aplicación gestiona los pedidos de material del taller. A continuación, un repaso breve de lo esencial; puede omitirse si ya se conoce la aplicación." : "Esta aplicación gestiona el stock, los montajes, los proyectos, los pedidos de material, el mantenimiento de vehículos y el personal del taller. A continuación, un repaso breve de lo esencial; puede omitirse si ya se conoce la aplicación."
    }, {
      titulo: "Las secciones",
      texto: __esTaller ? "En el menú de secciones (lateral en ordenador, abajo en móvil o tablet) están Trabajo (montajes y proyectos) y Reponer (lo que os falta en el taller: almacén lo entrega o, si no lo tiene, lo pide), cada una con su color propio para saber en qué sección se está." : "En el menú de secciones (lateral en ordenador, abajo en móvil o tablet) están Resumen, Trabajo (montajes y proyectos), Almacén, Reponer (lo que le falta al taller: se entrega del stock o se pide), Mantenimiento y Trabajadores; en el móvil, estas dos últimas están dentro de «Más». Cada sección tiene su color y su cartel arriba para saber en qué área se está."
    }, {
      titulo: "Escanear materiales",
      texto: "El campo de escaneo admite lector USB/Bluetooth, cámara del móvil o introducción manual del código. Tras leerlo, se solicita la cantidad."
    }, ...(__esTaller ? [] : [{
      titulo: "Escanear documentos",
      texto: "Desde Trabajo puede fotografiarse o subirse en PDF un albarán o una lista de materiales. El reconocimiento automático extrae las líneas y las añade a la solicitud pendiente."
    }]), {
      titulo: "Pedir material por chat",
      texto: __esTaller ? "En Trabajo → Chat se escribe qué hace falta, una línea por artículo (Intro baja de línea) y se pulsa «Enviar». Las unidades se indican con un número (por ejemplo «test1 5» o «5 test1») y varias referencias en una misma línea se separan solas. Almacén asigna las referencias; basta con describir el material." : "En Trabajo → Chat el taller escribe qué hace falta, una línea por artículo. Almacén revisa cada línea, asigna la referencia y comprueba la cantidad que se descuenta. Las unidades pueden escribirse con un número («test1 5» o «5 test1»)."
    }, {
      titulo: "El estado de cada pedido",
      texto: __esTaller ? "En cada orden, la franja «Estado del pedido» y la placa de cada línea dicen si está pedido a almacén, pedido a proveedor, listo para recoger o recogido. Cuando almacén lo prepara, llega el aviso «Material listo para recoger»." : "En cada orden, la franja «Estado del pedido» y la placa de cada línea muestran en qué punto está: pedido a almacén, pedido a proveedor, listo para recoger o recogido. Al pulsar «Preparar recogida», el taller recibe el aviso de que su material está listo."
    }, ...(__esTaller ? [] : [{
      titulo: "Interno, externo y pequeño material",
      texto: "En Hoja de pedido, cada línea se asigna con un toque a Interno, Externo o Pequeño material (y, en Externo, a Proveedor o Cliente). La aplicación propone un destino, con recuadro discontinuo, cuando esa referencia se ha decidido 3 veces igual y, tras 5 decisiones iguales y ninguna distinta, la clasifica sola con la etiqueta «Auto». Las líneas pueden moverse en cualquier momento. El listado externo se envía por correo a los 15 segundos de terminar de escribir, con opción de cancelar o enviar al momento."
    }]), {
      titulo: "Buscar en cualquier momento",
      texto: "El buscador de la parte superior funciona desde cualquier sección: permite localizar un material por código, artículo o referencia sin cambiar de pantalla."
    }, ...(__esTaller ? [] : [{
      titulo: "Herramientas de Almacén",
      texto: "En Almacén, el panel «Herramientas» permite imprimir etiquetas con código de barras para la Brother QL-700 (referencias y ubicaciones), hacer inventarios guiados por ubicación escaneando cada material y ajustar los mínimos de stock según el consumo."
    }, {
      titulo: "Trabajadores y ropa",
      texto: "En Trabajadores se crea la ficha de cada persona, se asigna su ropa de trabajo y se registra cada entrega. La aplicación señala las renovaciones vencidas y genera una hoja de entrega para firmar."
    }, {
      titulo: "Búsqueda global",
      texto: "El Resumen incluye un buscador que localiza materiales, órdenes y trabajadores a la vez, con acceso directo a cada resultado."
    }]), {
      titulo: "Esto es todo",
      texto: "Este repaso puede consultarse de nuevo en cualquier momento desde «Menú» → «Ayuda», arriba a la derecha."
    }];
  }
  let _0x4e45ef = 0;
  function _0x19220a() {
    const _0xe264d = __pasosAyuda();
    const _0x17db37 = _0xe264d[_0x4e45ef];
    const _0x40aaf6 = document.getElementById("tourBody");
    if (!_0x40aaf6) {
      return;
    }
    _0x40aaf6.innerHTML = "\n      <h1 style=\"font-size:22px; margin-bottom:8px;\">" + _0x17db37.titulo + "</h1>\n      <p style=\"color:var(--text-muted); font-size:14px; line-height:1.5; margin:0;\">" + _0x17db37.texto + "</p>\n      <div style=\"display:flex; justify-content:space-between; align-items:center; margin-top:18px; gap:10px;\">\n        <button class=\"cam-btn\" id=\"tourSaltarBtn\" style=\"flex:none; width:auto;\">Saltar</button>\n        <span style=\"color:var(--text-faint); font-size:12px;\">" + (_0x4e45ef + 1) + " / " + _0xe264d.length + "</span>\n        <button class=\"btn primary\" id=\"tourSiguienteBtn\" style=\"width:auto; flex:none; padding:10px 22px;\">" + (_0x4e45ef < _0xe264d.length - 1 ? "Siguiente" : "Empezar") + "</button>\n      </div>\n    ";
    document.getElementById("tourSaltarBtn").addEventListener("click", _0x27e5f3);
    document.getElementById("tourSiguienteBtn").addEventListener("click", () => {
      if (_0x4e45ef < _0xe264d.length - 1) {
        _0x4e45ef++;
        _0x19220a();
      } else {
        _0x27e5f3();
      }
    });
  }
  function _0x57f7e7() {
    _0x4e45ef = 0;
    const _0x2aa954 = document.getElementById("tourOverlay");
    if (!_0x2aa954) {
      return;
    }
    _0x2aa954.style.display = "flex";
    _0x19220a();
  }
  function _0x27e5f3() {
    const _0x1fe9a0 = document.getElementById("tourOverlay");
    if (_0x1fe9a0) {
      _0x1fe9a0.style.display = "none";
    }
    try {
      localStorage.setItem("tecnomat_tour_visto", "1");
    } catch (_0x7a60f4) {}
  }
  function _0x32e8d7() {
    const _0x532b35 = document.getElementById("ayudaBtnArea");
    if (!_0x532b35) {
      return;
    }
    _0x532b35.innerHTML = "<button class=\"cam-btn\" id=\"ayudaBtn\">Ayuda</button>";
    document.getElementById("ayudaBtn").addEventListener("click", _0x57f7e7);
  }
  function _0x453aa4() {
    let _0x5a9aed = false;
    try {
      _0x5a9aed = !!localStorage.getItem("tecnomat_tour_visto");
    } catch (_0x4cbc03) {}
    if (!_0x5a9aed) {
      _0x57f7e7();
    }
  }
  if (hayBackend) {
    const _0x3d2891 = document.getElementById("loginForm");
    _0x3d2891.addEventListener("submit", function (_0x1341b0) {
      _0x1341b0.preventDefault();
      const _0xfc6116 = document.getElementById("loginEmail").value.trim();
      const _0x1be047 = document.getElementById("loginPassword").value;
      _0x4cacf5("Entrando…");
      backend.auth.signIn(_0xfc6116, _0x1be047).catch(function (_0x49dad8) {
        _0x4cacf5("No se pudo iniciar sesión: " + _0x49dad8.message);
      });
    });
    backend.auth.onChange(function (_0x19d0e3) {
      if (_0x19d0e3) {
        _0x5e4b53(_0x19d0e3);
        _0x5c6639();
      } else {
        _0x4cacf5();
      }
    });
  } else {
    document.getElementById("app").style.display = "block";
    const _0x7d1e26 = document.getElementById("logoutArea");
    if (_0x7d1e26) {
      _0x7d1e26.innerHTML = "<span id=\"temaToggleArea\"></span><span id=\"ayudaBtnArea\"></span>";
    }
    _0x164745();
    _0x32e8d7();
    _0x453aa4();
    _0x5c6639();
  }
  let estado = {
    mode: "resumen",
    catalog: [],
    movements: [],
    movementsArchive: [],
    groups: {
      montaje: [],
      proyecto: []
    },
    current: {
      montaje: null,
      proyecto: null
    },
    groupData: {},
    bobinas: [],
    pedidoItems: [],
    pedidoRequesterName: "",
    vehiculos: [],
    tareasMantenimiento: [],
    vehiculoActualId: null,
    materialesRapidos: [],
    ocrAprendizaje: {},
    pedidoChat: [],
    pendingDelivery: null,
    deliveries: [],
    notifications: [],
    ubicaciones: [],
    deliveriesArchive: [],
    trabajadores: [],
    clasificacion: {
      ref: {},
      pal: {},
      email: ""
    },
    settings: {
      bobinaAvisoDias: 3,
      sonidoEscaneo: true,
      stockBajoUmbral: 2,
      avisoHora: 18,
      emailDestino: ""
    },
    alerts: {
      lastDailyCheck: null,
      lastWeeklyCheckMs: null
    }
  };
  let _0x24edec = null;
  let _0x1dfbd0 = null;
  let _0x1a8b0d = "";
  let _0x2ba7a9 = 80;
  let _0x217aa6 = "";
  let _0xf103fd = new Set();
  let _0x236c29 = new Set();
  let _0x4a2438 = {
    nombre: "",
    requester: "",
    tipo: "",
    kind: "montaje"
  };
  let _0x506050 = "";
  const _0x23f5f6 = ["Material eléctrico", "Material hidráulico", "Manguera o cable", "Artículos para cuadros", "Ropa"];
  let _0x5592da = "chat";
  const _0x535db1 = {
    montaje: "orden",
    proyecto: "proyecto"
  };
  const _0x216efa = {
    montaje: "Orden",
    proyecto: "Proyecto"
  };
  const $ = _0x542141 => document.querySelector(_0x542141);
  const nuevoId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  let _0xff8226 = null;
  function _0x1b0734(_0x347d91) {
    const _0x855375 = $("#appDialogOverlay");
    if (_0x855375) {
      _0x855375.style.display = "none";
    }
    const _0x3a0191 = _0xff8226;
    _0xff8226 = null;
    if (_0x3a0191) {
      _0x3a0191(_0x347d91);
    }
  }
  function _0x2cc777(_0x28a00a) {
    return new Promise(_0xfdea51 => {
      const _0x53ffba = $("#appDialogOverlay");
      if (!_0x53ffba) {
        _0xfdea51(window.confirm(_0x28a00a));
        return;
      }
      if (_0xff8226) {
        _0x1b0734(false);
      }
      _0xff8226 = _0xfdea51;
      $("#appDialogMsg").textContent = _0x28a00a;
      const _0x29dd2a = $("#appDialogInput");
      _0x29dd2a.style.display = "none";
      _0x29dd2a.value = "";
      const _0x5256f0 = $("#appDialogCancelBtn");
      _0x5256f0.style.display = "";
      _0x53ffba.style.display = "flex";
      $("#appDialogOkBtn").onclick = () => _0x1b0734(true);
      _0x5256f0.onclick = () => _0x1b0734(false);
    });
  }
  function _0x3b375f(_0x4059c2, _0x577c6a) {
    return new Promise(_0x3871b7 => {
      const _0x2c02c0 = $("#appDialogOverlay");
      if (!_0x2c02c0) {
        _0x3871b7(window.prompt(_0x4059c2, _0x577c6a));
        return;
      }
      if (_0xff8226) {
        _0x1b0734(null);
      }
      _0xff8226 = _0x3871b7;
      $("#appDialogMsg").textContent = _0x4059c2;
      const _0x200b9f = $("#appDialogInput");
      _0x200b9f.style.display = "";
      _0x200b9f.value = _0x577c6a != null ? String(_0x577c6a) : "";
      $("#appDialogCancelBtn").style.display = "";
      _0x2c02c0.style.display = "flex";
      setTimeout(() => {
        _0x200b9f.focus();
        _0x200b9f.select();
      }, 30);
      _0x200b9f.onkeydown = _0x45257b => {
        if (_0x45257b.key === "Enter") {
          _0x45257b.preventDefault();
          $("#appDialogOkBtn").click();
        }
      };
      $("#appDialogOkBtn").onclick = () => _0x1b0734(_0x200b9f.value);
      $("#appDialogCancelBtn").onclick = () => _0x1b0734(null);
    });
  }
  function grupoVacio() {
    return {
      servido: [],
      devuelto: [],
      pendiente: {
        requesterName: "",
        items: []
      },
      chat: [],
      documentos: [],
      materialesFaltantes: []
    };
  }
  const fechaHoraTexto = () => new Date().toLocaleString("es-ES");
  const aSlug = _0xde68be => _0xde68be.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const _0x1d1ab0 = _0x4a4f5c => String(_0x4a4f5c == null ? "" : _0x4a4f5c).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const _0x3edff0 = {
    editar: "<path d=\"M11 4H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-7\"/><path d=\"M14.5 2.5a1.5 1.5 0 0 1 2 2L10 11l-3 1 1-3 6.5-6.5Z\"/>",
    eliminar: "<path d=\"M3 5h10M6 5V3.5A1.5 1.5 0 0 1 7.5 2h1A1.5 1.5 0 0 1 10 3.5V5m1.5 0-.6 8.4a1 1 0 0 1-1 .9H5.1a1 1 0 0 1-1-.9L3.5 5\"/>",
    enviar: "<path d=\"M2 8 14 2 8 14l-1.5-4.5L2 8Z\"/>",
    guardar: "<path d=\"M3 3h9l2 2v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z\"/><path d=\"M5 3v4h6V3M5 10h6\"/>"
  };
  function _0x42c913(_0x27041d) {
    try {
      const [_0x538aa9, _0x226ab0] = _0x27041d.split(",");
      const _0xd32945 = _0x538aa9.match(/data:(.*?);base64/)[1];
      const _0x573c7b = atob(_0x226ab0);
      const _0x104535 = new Uint8Array(_0x573c7b.length);
      for (let _0x1f0a81 = 0; _0x1f0a81 < _0x573c7b.length; _0x1f0a81++) {
        _0x104535[_0x1f0a81] = _0x573c7b.charCodeAt(_0x1f0a81);
      }
      const _0x5750fa = new Blob([_0x104535], {
        type: _0xd32945
      });
      const _0x80b4e9 = URL.createObjectURL(_0x5750fa);
      window.open(_0x80b4e9, "_blank");
      setTimeout(() => URL.revokeObjectURL(_0x80b4e9), 60000);
    } catch (_0x2d0f82) {
      _0x279f78("No se pudo abrir el documento: " + _0x2d0f82.message);
    }
  }
  function _0x56ae2b(_0x24b712) {
    return "<svg viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"width:13px; height:13px; flex:none; opacity:.85; vertical-align:-2px; margin-right:5px;\">" + (_0x3edff0[_0x24b712] || "") + "</svg>";
  }
  function _0x5cfc5(_0x39d56f, _0x2ea67a) {
    let _0x48cf6b;
    return (..._0x3e11ac) => {
      clearTimeout(_0x48cf6b);
      _0x48cf6b = setTimeout(() => _0x39d56f(..._0x3e11ac), _0x2ea67a);
    };
  }
  function _0x5dc8ea(_0x102688, _0x26d7d9) {
    const _0x448b15 = _0x102688.length ? _0x102688 : [_0x26d7d9 || {}];
    const _0x513e2d = XLSX.utils.aoa_to_sheet([["TECNOMAT · Control de materiales"], []]);
    XLSX.utils.sheet_add_json(_0x513e2d, _0x448b15, {
      origin: "A3"
    });
    return _0x513e2d;
  }
  function _0x279f78(_0xbb0204, _0x49625e) {
    const _0x55e3f3 = $("#statusBanner");
    const _0x43495f = /^(No se pu|No he |Ya no hay|Falta |Indica |Escribe |Rellena |Configura |Selecciona |El .*no puede|El pedido está vacío|La solicitud está vacía|La orden\/proyecto|Ese código no existe|Solo quedan|Formato no soportado|Tu navegador no soporta|Esa ubicación ya está|Error )/i.test(_0xbb0204);
    _0x55e3f3.className = "status-banner" + (_0x43495f ? " error" : "");
    _0x55e3f3.innerHTML = _0x1d1ab0(_0xbb0204) + (_0x49625e ? " <button id=\"undoBtn\" class=\"btn-return\" style=\"margin-left:8px; padding:3px 9px; font-size:11px;\">Deshacer</button>" : "");
    _0x55e3f3.style.display = "block";
    if (_0x49625e) {
      const _0x548f30 = $("#undoBtn");
      if (_0x548f30) {
        _0x548f30.addEventListener("click", () => {
          _0x55e3f3.style.display = "none";
          _0x49625e();
        });
      }
    }
    clearTimeout(_0x279f78._t);
    _0x279f78._t = setTimeout(() => {
      _0x55e3f3.style.display = "none";
    }, 8000);
  }
  function _0x179b09() {
    const _0x2934c3 = $("#offlineBanner");
    if (!_0x2934c3) {
      return;
    }
    if (navigator.onLine) {
      if (_0x2934c3.style.display !== "none") {
        _0x2934c3.textContent = "Conexión recuperada — sincronizando de nuevo.";
        setTimeout(() => {
          _0x2934c3.style.display = "none";
        }, 3000);
      }
    } else {
      _0x2934c3.textContent = "Sin conexión — los cambios se guardan en este dispositivo, pero no se están sincronizando con los demás hasta que vuelva la conexión.";
      _0x2934c3.style.display = "block";
    }
  }
  window.addEventListener("online", _0x179b09);
  window.addEventListener("offline", _0x179b09);
  if (!navigator.onLine) {
    _0x179b09();
  }
  const _0x5b358b = "tecnomat_materiales_";
  (function () {
    const _0x266ff9 = document.getElementById("autosaveNote");
    if (!_0x266ff9) {
      return;
    }
    if (hayBackend) {
      _0x266ff9.innerHTML = "<span class=\"autosave-dot\"></span> Guardado en la nube — compartido entre todos los dispositivos.";
    } else {
      _0x266ff9.innerHTML = "<span class=\"autosave-dot\"></span> Guardado automáticamente en este navegador (localStorage). Usa \"Descargar todo\" en Almacén para tener una copia fuera del navegador, o configura Supabase para compartirlo entre dispositivos.";
    }
  })();
  async function _0x31ceb4(_0x53c567) {
    try {
      if (hayBackend) {
        try {
          return await backend.get(_0x53c567);
        } catch (_0xfab949) {
          const _0x5a52a1 = localStorage.getItem(_0x5b358b + _0x53c567);
          if (_0x5a52a1) {
            return JSON.parse(_0x5a52a1);
          } else {
            return null;
          }
        }
      }
      const _0x331e1a = localStorage.getItem(_0x5b358b + _0x53c567);
      if (_0x331e1a) {
        return JSON.parse(_0x331e1a);
      } else {
        return null;
      }
    } catch (_0x3d429f) {
      return null;
    }
  }
  async function guardar(_0x1f6b21, _0xf76f02) {
    try {
      if (hayBackend) {
        try {
          return await backend.set(_0x1f6b21, _0xf76f02);
        } catch (_0x47d33f) {
          localStorage.setItem(_0x5b358b + _0x1f6b21, JSON.stringify(_0xf76f02));
          // Esta copia local solo se usa para volver a cargar en este dispositivo: no se sube sola
          _0x279f78("No se pudo guardar \"" + _0x1f6b21 + "\" en el servidor (" + (_0x47d33f && _0x47d33f.message || "error") + "). Queda una copia solo en este dispositivo.");
          return {
            key: _0x1f6b21,
            value: _0xf76f02
          };
        }
      }
      localStorage.setItem(_0x5b358b + _0x1f6b21, JSON.stringify(_0xf76f02));
      return {
        key: _0x1f6b21,
        value: _0xf76f02
      };
    } catch (_0x963269) {
      _0x279f78("Error guardando \"" + _0x1f6b21 + "\": " + _0x963269.message);
      return null;
    }
  }
  async function _0x5390a2(_0x4a7153) {
    try {
      if (hayBackend) {
        await backend.delete(_0x4a7153);
        return;
      }
      localStorage.removeItem(_0x5b358b + _0x4a7153);
    } catch (_0x117748) {}
  }
  async function _0x5c6639() {
    const [_0x262bd3, _0xea2297, _0x1a2d48, _0x34c9a2, _0x4509f8, _0x17a9ad, _0x4505ef, _0x1838a1, _0x1063d2, _0x993dc3, _0x120b29, _0xe26337, _0x262efb, _0x457b08, _0x5bd3f0, _0x3712ce, _0x2f3347, _0x550237, _0x266294, _0x44019a, _0x6bec81, __trabajadoresRaw, __clasifRaw] = await Promise.all([_0x31ceb4("catalog"), _0x31ceb4("movements"), _0x31ceb4("groups_montaje"), _0x31ceb4("groups_proyecto"), _0x31ceb4("lists"), _0x31ceb4("projects"), _0x31ceb4("app_state"), _0x31ceb4("bobinas"), _0x31ceb4("settings"), _0x31ceb4("alerts_state"), _0x31ceb4("pedido_items"), _0x31ceb4("movements_archive"), _0x31ceb4("deliveries"), _0x31ceb4("notifications"), _0x31ceb4("ubicaciones"), _0x31ceb4("deliveries_archive"), _0x31ceb4("pedido_chat"), _0x31ceb4("pedido_requester"), _0x31ceb4("vehiculos"), _0x31ceb4("tareas_mantenimiento"), _0x31ceb4("ocr_aprendizaje"), _0x31ceb4("trabajadores"), _0x31ceb4("clasificacion")]);
    if (_0x262bd3) {
      recordarCatalogo(_0x262bd3);
      estado.catalog = _0x262bd3.map(_0xb6fc8b => ({
        id: _0xb6fc8b.id || nuevoId(),
        code: _0xb6fc8b.code,
        desc: _0xb6fc8b.desc,
        qty: typeof _0xb6fc8b.qty === "number" ? _0xb6fc8b.qty : 0,
        location: _0xb6fc8b.location || "",
        specs: _0xb6fc8b.specs || "",
        marca: _0xb6fc8b.marca || "",
        referencia: _0xb6fc8b.referencia || "",
        categoria: _0xb6fc8b.categoria || "",
        coste: typeof _0xb6fc8b.coste === "number" ? _0xb6fc8b.coste : 0
      }));
    }
    if (_0xea2297) {
      estado.movements = _0xea2297;
    }
    if (_0xe26337) {
      estado.movementsArchive = _0xe26337;
    }
    if (_0x1838a1) {
      estado.bobinas = _0x1838a1;
    }
    if (_0x120b29) {
      estado.pedidoItems = _0x120b29;
    }
    if (_0x2f3347) {
      estado.pedidoChat = _0x2f3347;
    }
    if (_0x550237) {
      estado.pedidoRequesterName = _0x550237;
    }
    if (_0x266294) {
      estado.vehiculos = _0x266294;
    }
    if (_0x44019a) {
      estado.tareasMantenimiento = _0x44019a;
    }
    if (_0x6bec81) {
      estado.ocrAprendizaje = _0x6bec81;
    }
    if (__trabajadoresRaw) {
      estado.trabajadores = __trabajadoresRaw;
    }
    if (__clasifRaw) {
      estado.clasificacion = __clasifRaw;
    }
    if (estado.vehiculos.length && !estado.vehiculoActualId) {
      estado.vehiculoActualId = estado.vehiculos[0].id;
    }
    if (_0x262efb) {
      estado.deliveries = _0x262efb;
    }
    if (_0x457b08) {
      estado.notifications = _0x457b08;
    }
    if (_0x5bd3f0) {
      estado.ubicaciones = _0x5bd3f0;
    }
    if (_0x3712ce) {
      estado.deliveriesArchive = _0x3712ce;
    }
    estado.notifications.forEach(_0x185901 => _0x1f4699.add(_0x185901.id));
    if (_0x1063d2) {
      estado.settings = Object.assign({}, estado.settings, _0x1063d2);
    }
    if (_0x993dc3) {
      estado.alerts = _0x993dc3;
    }
    if (_0x1a2d48) {
      estado.groups.montaje = _0x1a2d48;
    }
    if (_0x34c9a2) {
      estado.groups.proyecto = _0x34c9a2;
    } else if (_0x17a9ad) {
      estado.groups.proyecto = _0x17a9ad.map(_0x1f0639 => typeof _0x1f0639 === "string" ? {
        name: _0x1f0639,
        status: "activo"
      } : {
        name: _0x1f0639.name,
        status: _0x1f0639.status || "activo"
      });
      guardarListaGrupos("proyecto");
    }
    if (_0x4505ef) {
      estado.mode = "resumen";
      estado.current.montaje = _0x4505ef.currentMontajeOrder || null;
      estado.current.proyecto = _0x4505ef.currentProject || null;
      if (_0x4505ef.vehiculoActualId) {
        estado.vehiculoActualId = _0x4505ef.vehiculoActualId;
      }
    }
    if (!_0x1a2d48 && _0x4509f8 && _0x4509f8.montaje && (_0x4509f8.montaje.servido.length || _0x4509f8.montaje.devuelto.length)) {
      const _0x1d4585 = _0x4509f8.montaje;
      estado.groups.montaje = [{
        name: "General",
        status: "activo"
      }];
      estado.groupData["montaje::General"] = Object.assign(grupoVacio(), _0x1d4585);
      guardarListaGrupos("montaje");
      guardar("group_montaje_" + aSlug("General"), _0x1d4585);
      if (!estado.current.montaje) {
        estado.current.montaje = "General";
      }
    }
    for (const _0x5597e6 of estado.groups.proyecto) {
      if (!estado.groupData["proyecto::" + _0x5597e6.name]) {
        const _0x52832c = await _0x31ceb4("project_" + aSlug(_0x5597e6.name));
        if (_0x52832c) {
          estado.groupData["proyecto::" + _0x5597e6.name] = Object.assign(grupoVacio(), _0x52832c);
          guardarGrupo("proyecto", _0x5597e6.name);
        }
      }
    }
    if (estado.current.montaje) {
      const _0x2b6339 = "montaje::" + estado.current.montaje;
      if (!estado.groupData[_0x2b6339]) {
        const _0x29b815 = await _0x31ceb4("group_montaje_" + aSlug(estado.current.montaje));
        estado.groupData[_0x2b6339] = _0x29b815 ? Object.assign(grupoVacio(), _0x29b815) : grupoVacio();
      }
    }
    if (estado.current.proyecto) {
      const _0x35f2ec = "proyecto::" + estado.current.proyecto;
      if (!estado.groupData[_0x35f2ec]) {
        const _0x58dd8b = await _0x31ceb4("group_proyecto_" + aSlug(estado.current.proyecto));
        estado.groupData[_0x35f2ec] = _0x58dd8b ? Object.assign(grupoVacio(), _0x58dd8b) : grupoVacio();
      }
    }
    render();
    _0x5d7cfc();
    _0x4b1425();
    setInterval(() => {
      _0x5d7cfc();
      _0x4b1425();
    }, 300000);
    _0x1314ff();
  }
  let _0xfe86c7 = {};
  const _0x1512ce = _0x5cfc5(() => {
    let __firmaRealtime;
    try {
      __firmaRealtime = JSON.stringify(estado);
    } catch {
      __firmaRealtime = null;
    }
    if (__firmaRealtime !== null && _0x1512ce.__ultimaFirma === __firmaRealtime) {
      return;
    }
    if (__firmaRealtime !== null) {
      _0x1512ce.__ultimaFirma = __firmaRealtime;
    }
    render();
  }, 80);
  function escuchar(_0x2026ae, _0x1239bd) {
    if (!hayBackend) {
      return;
    }
    if (_0xfe86c7[_0x2026ae]) {
      _0xfe86c7[_0x2026ae]();
    }
    _0xfe86c7[_0x2026ae] = backend.watch(_0x2026ae, _0x5df280 => {
      _0x1239bd(_0x5df280);
      _0x1512ce();
    });
  }
  function _0x1314ff() {
    if (!hayBackend) {
      return;
    }
    escuchar("catalog", _0x117fb8 => {
      recordarCatalogo(_0x117fb8);
      estado.catalog = _0x117fb8.map(_0x8a84b1 => ({
        id: _0x8a84b1.id || nuevoId(),
        code: _0x8a84b1.code,
        desc: _0x8a84b1.desc,
        qty: typeof _0x8a84b1.qty === "number" ? _0x8a84b1.qty : 0,
        location: _0x8a84b1.location || "",
        specs: _0x8a84b1.specs || "",
        marca: _0x8a84b1.marca || "",
        referencia: _0x8a84b1.referencia || "",
        categoria: _0x8a84b1.categoria || "",
        coste: typeof _0x8a84b1.coste === "number" ? _0x8a84b1.coste : 0
      }));
    });
    escuchar("movements", _0x8b2fa5 => {
      estado.movements = _0x8b2fa5;
    });
    escuchar("bobinas", _0xc2f9cd => {
      estado.bobinas = _0xc2f9cd;
    });
    escuchar("settings", _0x47fae3 => {
      estado.settings = Object.assign({}, estado.settings, _0x47fae3);
    });
    escuchar("pedido_items", _0x5a6893 => {
      estado.pedidoItems = _0x5a6893;
    });
    escuchar("notifications", _0x3346db => {
      estado.notifications = _0x3346db;
    });
    _0x4efabf();
    if (backend.watchOrdenesTrabajo) {
      backend.watchOrdenesTrabajo(_0x192438 => recibirOrdenTrabajo(_0x192438));
    }
    sincronizarEnlace();
    enviarAjustesPendientes();
    if (backend.watchMateriales) {
      backend.watchMateriales(_0xa63053 => recibirMaterialA3(_0xa63053));
    }
    if (backend.getMaterialesActuales) {
      backend.getMaterialesActuales().then(_0x2d2f54 => {
        _0x2d2f54.forEach(_0x1f9362 => recibirMaterialA3(_0x1f9362));
      }).catch(_0x1d5c5e => {});
    }
    const _0x2621d2 = () => {
      if (!backend.getMaterialesRapidos) {
        return;
      }
      backend.getMaterialesRapidos().then(_0x3aaecc => {
        estado.materialesRapidos = _0x3aaecc;
        render();
      }).catch(_0xf5808 => {});
    };
    _0x2621d2();
    if (backend.watchMaterialesRapidos) {
      backend.watchMaterialesRapidos(_0x2621d2);
    }
  }
  function recibirMaterialA3(_0x2050de) {
    const _0x3fd4eb = (_0x2050de.codigo_articulo || "").trim();
    if (!_0x3fd4eb) {
      return;
    }
    const _0x3ce1df = buscarPorCodigo(_0x3fd4eb);
    if (_0x3ce1df) {
      if (_0x2050de.descripcion) {
        _0x3ce1df.desc = _0x2050de.descripcion;
      }
      _0x3ce1df.origenA3 = true;
      guardarCatalogo();
    } else {
      estado.catalog.push({
        id: nuevoId(),
        code: _0x3fd4eb,
        desc: _0x2050de.descripcion || _0x3fd4eb,
        qty: 0,
        location: "",
        specs: "",
        marca: "",
        referencia: "",
        categoria: "",
        coste: 0,
        origenA3: true
      });
      guardarCatalogo();
    }
    render();
  }
  // opciones.sinCorreo: OT recuperada al abrir la app (no se manda un correo por cada una)
  async function recibirOrdenTrabajo(_0x5f8196, opciones = {}) {
    const _0x25b041 = _0x5f8196.tipo_orden === "proyecto" ? "proyecto" : "montaje";
    if (buscarGrupo(_0x25b041, _0x5f8196.nombre)) {
      return;
    }
    const __grupoNuevo = {
      name: _0x5f8196.nombre,
      status: _0x5f8196.estado || "activo",
      tipo: _0x5f8196.interno_externo || "",
      otId: _0x5f8196.id || null,
      esquemas: []
    };
    estado.groups[_0x25b041].push(__grupoNuevo);
    guardarListaGrupos(_0x25b041);
    await actualizarEsquemas(_0x25b041, __grupoNuevo);
    let _0x1e1a4b = [];
    try {
      _0x1e1a4b = await backend.getMaterialesDeOrden(_0x5f8196.id);
    } catch (_0x25b6e8) {}
    const _0x5573f2 = _0x1e1a4b.map(_0x11124a => {
      const _0xe21b6d = buscarPorCodigo(_0x11124a.codigo);
      if (_0xe21b6d) {
        return {
          id: nuevoId(),
          itemId: _0xe21b6d.id,
          code: _0xe21b6d.code,
          desc: _0xe21b6d.desc,
          referencia: _0x11124a.referencia || _0xe21b6d.referencia || "",
          qty: Number(_0x11124a.cantidad) || 1,
          pedido: 0,
          reserva: 0
        };
      } else {
        return {
          id: nuevoId(),
          itemId: null,
          code: "",
          desc: "",
          referencia: _0x11124a.referencia || "",
          textoLibre: _0x11124a.descripcion || _0x11124a.codigo,
          qty: Number(_0x11124a.cantidad) || 1,
          pedido: 0,
          reserva: 0
        };
      }
    });
    const _0x4d0dd2 = grupoVacio();
    _0x4d0dd2.pendiente.requesterName = _0x5f8196.solicitante || "";
    _0x4d0dd2.pendiente.items = _0x5573f2;
    anadirMensajeChat(_0x4d0dd2.chat, "Recibida desde otra app" + (_0x5f8196.solicitante ? " · pedido por " + _0x5f8196.solicitante : "") + " · " + _0x5573f2.length + " línea(s) de material");
    estado.groupData[_0x25b041 + "::" + _0x5f8196.nombre] = _0x4d0dd2;
    guardarGrupo(_0x25b041, _0x5f8196.nombre);
    if (!opciones.sinCorreo) enviarCorreoAviso("Nueva OT recibida — " + _0x5f8196.nombre, "Se ha recibido automáticamente desde otra app.\n\nPedido por: " + (_0x5f8196.solicitante || "sin especificar") + "\nLíneas: " + _0x5573f2.length);
    estado.notifications.unshift({
      id: nuevoId(),
      groupKind: _0x25b041,
      groupName: _0x5f8196.nombre,
      requesterName: _0x5f8196.solicitante || "sin especificar",
      tipo: _0x5f8196.interno_externo || "",
      lineas: _0x5573f2.length,
      ts: fechaHoraTexto(),
      tsMs: Date.now(),
      leida: false
    });
    guardarAvisos();
    render();
  }
  async function actualizarEsquemas(tipo, grupo) {
    if (!grupo.otId) {
      return;
    }
    try {
      const esquemas = TecnomatEnlace.esquemasSeguros(await backend.getEsquemasDeOrden(grupo.otId));
      if (JSON.stringify(esquemas) !== JSON.stringify(grupo.esquemas || [])) {
        grupo.esquemas = esquemas;
        guardarListaGrupos(tipo);
        render();
      }
    } catch (e) {}
  }
  // Al abrir la app: OT que llegaron con la app cerrada (el aviso en tiempo real solo ve las nuevas),
  // esquemas al día y trabajadores de la app hermana. Sin Supabase no hace nada.
  async function sincronizarEnlace() {
    try {
      for (const ot of await backend.getOrdenesActivas()) {
        const tipo = ot.tipo_orden === "proyecto" ? "proyecto" : "montaje";
        const grupo = buscarGrupo(tipo, ot.nombre);
        if (!grupo) {
          await recibirOrdenTrabajo(ot, { sinCorreo: true });
        } else {
          if (!grupo.otId) {
            grupo.otId = ot.id;
            guardarListaGrupos(tipo);
          }
          await actualizarEsquemas(tipo, grupo);
        }
      }
    } catch (e) {}
    try {
      const { lista, cambiado } = TecnomatEnlace.fusionarTrabajadores(estado.trabajadores, await backend.getTrabajadoresExternos(), nuevoId);
      if (cambiado) {
        estado.trabajadores = lista;
        __guardarTrabajadores();
        render();
      }
    } catch (e) {}
  }
  function _0x4efabf() {
    if (!hayBackend) {
      return;
    }
    ["montaje", "proyecto"].forEach(_0x3cd23c => {
      const _0x4e0ced = estado.current[_0x3cd23c];
      if (!_0x4e0ced) {
        return;
      }
      escuchar("group_" + _0x3cd23c + "_" + aSlug(_0x4e0ced), _0x49e120 => {
        const _0x15ad47 = Object.assign(grupoVacio(), _0x49e120);
        const _0x534093 = _0x3cd23c + "::" + _0x4e0ced;
        if (estado.groupData[_0x534093]) {
          Object.assign(estado.groupData[_0x534093], _0x15ad47);
        } else {
          estado.groupData[_0x534093] = _0x15ad47;
        }
      });
    });
  }
  function _0x430fb2() {
    guardar("app_state", {
      mode: estado.mode,
      currentMontajeOrder: estado.current.montaje,
      currentProject: estado.current.proyecto,
      vehiculoActualId: estado.vehiculoActualId
    });
  }
  // Guarda `valorLocal` uniéndolo con lo que haya en el servidor (fusionar), en una transacción.
  // Sin backend o sin conexión, guarda como siempre: mejor eso que perder lo escrito.
  async function guardarFusionado(clave, valorLocal, fusionar, alTerminar) {
    if (!hayBackend || !backend.modificar || !navigator.onLine) {
      return guardar(clave, valorLocal);
    }
    try {
      const valor = await backend.modificar(clave, servidor => servidor == null ? valorLocal : fusionar(servidor));
      if (alTerminar) {
        alTerminar(valor);
      }
      return { key: clave, value: valor };
    } catch (e) {
      return guardar(clave, valorLocal);
    }
  }
  // Ids del catálogo que este dispositivo ya ha visto: distingue «lo borré aquí» de «lo creó otro dispositivo»
  const idsCatalogoConocidos = new Set();
  const recordarCatalogo = lista => (lista || []).forEach(x => idsCatalogoConocidos.add(x.id));
  // sustituir: solo al restaurar una copia de seguridad, que debe reemplazar también las cantidades
  function guardarCatalogo(sustituir) {
    if (sustituir === true) {
      return guardar("catalog", estado.catalog);
    }
    const local = estado.catalog;
    return guardarFusionado("catalog", local, servidor => TecnomatDatos.fusionarCatalogo(servidor, local, idsCatalogoConocidos), valor => {
      recordarCatalogo(valor);
      if (estado.catalog === local) {
        estado.catalog = valor;
        render();
      }
    });
  }
  function _0x240f8a() {
    if (estado.movements.length > 600) {
      const _0x6524ad = estado.movements.slice(500);
      estado.movements = estado.movements.slice(0, 500);
      _0xbba8cb(_0x6524ad);
    }
    const local = estado.movements;
    guardarFusionado("movements", local, servidor => TecnomatDatos.fusionarPorId(servidor, local), valor => {
      if (estado.movements === local) {
        estado.movements = valor;
      }
    });
  }
  async function _0xbba8cb(_0x180cf0) {
    const _0x4cc5e7 = {};
    _0x180cf0.forEach(_0x30b772 => {
      const _0x5233da = (_0x30b772.tsMs ? new Date(_0x30b772.tsMs) : new Date()).toISOString().slice(0, 7);
      if (!_0x4cc5e7[_0x5233da]) {
        _0x4cc5e7[_0x5233da] = {
          month: _0x5233da,
          entradas: 0,
          salidas: 0,
          eliminados: 0
        };
      }
      if (_0x30b772.type === "entrada") {
        _0x4cc5e7[_0x5233da].entradas += _0x30b772.qty;
      } else if (_0x30b772.type === "salida") {
        _0x4cc5e7[_0x5233da].salidas += _0x30b772.qty;
      } else if (_0x30b772.type === "eliminado") {
        _0x4cc5e7[_0x5233da].eliminados++;
      }
    });
    const _0x18c7a6 = (await _0x31ceb4("movements_archive")) || [];
    Object.values(_0x4cc5e7).forEach(_0x152893 => {
      const _0x5a4fd0 = _0x18c7a6.find(_0x2ee597 => _0x2ee597.month === _0x152893.month);
      if (_0x5a4fd0) {
        _0x5a4fd0.entradas += _0x152893.entradas;
        _0x5a4fd0.salidas += _0x152893.salidas;
        _0x5a4fd0.eliminados += _0x152893.eliminados;
      } else {
        _0x18c7a6.push(_0x152893);
      }
    });
    _0x18c7a6.sort((_0x1435e7, _0x487160) => _0x487160.month.localeCompare(_0x1435e7.month));
    estado.movementsArchive = _0x18c7a6;
    guardar("movements_archive", _0x18c7a6);
  }
  function guardarListaGrupos(_0x2bb54b) {
    guardar("groups_" + _0x2bb54b, estado.groups[_0x2bb54b]);
  }
  // El chat de la orden se une con el del servidor: dos personas escribiendo a la vez no se borran los mensajes.
  function guardarGrupo(_0x22ca02, _0x9ffa21) {
    const local = estado.groupData[_0x22ca02 + "::" + _0x9ffa21];
    if (!local) {
      return;
    }
    return guardarFusionado("group_" + _0x22ca02 + "_" + aSlug(_0x9ffa21), local, servidor => Object.assign({}, local, {
      chat: TecnomatDatos.fusionarPorId(servidor.chat, local.chat, "asc", 300)
    }), valor => {
      if (estado.groupData[_0x22ca02 + "::" + _0x9ffa21] === local) {
        local.chat = valor.chat;
      }
    });
  }
  function _0x217fa8() {
    guardar("bobinas", estado.bobinas);
  }
  function _0x253c4d() {
    guardar("pedido_items", estado.pedidoItems);
  }
  function _0x18fe55() {
    guardar("pedido_requester", estado.pedidoRequesterName);
  }
  function _0x932e35() {
    guardar("vehiculos", estado.vehiculos);
  }
  function _0x3e790f() {
    guardar("tareas_mantenimiento", estado.tareasMantenimiento);
  }
  function _0x56ccc4() {
    guardar("ocr_aprendizaje", estado.ocrAprendizaje);
  }
  const _0x1d5219 = 86400000;
  function _0x57b7e7(_0x2eba06, _0x50699b) {
    const _0x54f0c0 = new Date(_0x2eba06 + "T00:00:00");
    _0x54f0c0.setMonth(_0x54f0c0.getMonth() + _0x50699b);
    return _0x54f0c0.toISOString().slice(0, 10);
  }
  function _0x22e6c7(_0x480059, _0xa600cf) {
    let _0x2e7077 = null;
    let _0x205b6d = null;
    if (_0x480059.intervaloKm && _0x480059.ultimoKm != null) {
      _0x2e7077 = _0x480059.ultimoKm + _0x480059.intervaloKm;
    }
    if (_0x480059.intervaloMeses && _0x480059.ultimaFecha) {
      _0x205b6d = _0x57b7e7(_0x480059.ultimaFecha, _0x480059.intervaloMeses);
    }
    let _0x2b39c0 = _0x2e7077 != null ? _0x2e7077 - _0xa600cf : null;
    let _0x11c8ed = _0x205b6d != null ? Math.round((new Date(_0x205b6d + "T00:00:00") - new Date(_0x535f33() + "T00:00:00")) / _0x1d5219) : null;
    let _0x584043 = "ok";
    if (_0x2b39c0 != null && _0x2b39c0 <= 0 || _0x11c8ed != null && _0x11c8ed <= 0) {
      _0x584043 = "atrasada";
    } else if (_0x2b39c0 != null && _0x2b39c0 <= 800 || _0x11c8ed != null && _0x11c8ed <= 30) {
      _0x584043 = "pronto";
    }
    let _0x272179 = Infinity;
    if (_0x2b39c0 != null) {
      _0x272179 = Math.min(_0x272179, _0x2b39c0);
    }
    if (_0x11c8ed != null) {
      _0x272179 = Math.min(_0x272179, _0x11c8ed * 33);
    }
    return {
      proximoKm: _0x2e7077,
      proximaFecha: _0x205b6d,
      kmRestantes: _0x2b39c0,
      diasRestantes: _0x11c8ed,
      estado: _0x584043,
      urgencia: _0x272179
    };
  }
  function _0x535f33() {
    return new Date().toISOString().slice(0, 10);
  }
  function _0x267a5a() {
    return estado.vehiculos.find(_0x5d959b => _0x5d959b.id === estado.vehiculoActualId) || null;
  }
  function _0x4f0ebd(_0x2636e5) {
    return estado.tareasMantenimiento.filter(_0x147836 => _0x147836.vehiculoId === _0x2636e5);
  }
  async function _0x30b7a6() {
    const _0x5ba962 = await _0x3b375f("¿Quién hace este pedido? (obligatorio)");
    if (!_0x5ba962 || !_0x5ba962.trim()) {
      return false;
    }
    estado.pedidoRequesterName = _0x5ba962.trim();
    _0x18fe55();
    return true;
  }
  async function _0x328b69(_0x1c334d) {
    if (_0x1c334d.pendiente.requesterName) {
      return true;
    }
    const _0x8736d2 = await _0x3b375f("¿Quién pide este material? (obligatorio)");
    if (!_0x8736d2 || !_0x8736d2.trim()) {
      return false;
    }
    _0x1c334d.pendiente.requesterName = _0x8736d2.trim();
    return true;
  }
  function _0x2fa0b5() {
    guardar("pedido_chat", estado.pedidoChat.slice(-200));
  }
  function anadirMensajeChat(_0x178b04, _0x123dde) {
    _0x178b04.push({
      id: nuevoId(),
      texto: _0x123dde,
      ts: fechaHoraTexto(),
      tsMs: Date.now(),
      usuario: usuarioActual()
    });
    if (_0x178b04.length > 300) {
      _0x178b04.splice(0, _0x178b04.length - 300);
    }
  }
  function _0x10279f(_0x55f5a8) {
    const _0x478121 = _0x55f5a8.querySelector(".chat-feed");
    if (_0x478121) {
      _0x478121.scrollTop = _0x478121.scrollHeight;
    }
  }
  function _0x17a460(_0x362fa9, _0x27790c) {
    _0x27790c = _0x27790c || {};
    if (!_0x362fa9.length) {
      return "<div class=\"empty-state\">Todavía no hay nada — escanea o escribe algo para empezar.</div>";
    }
    return "<div class=\"chat-feed\">" + _0x362fa9.map(_0x3e7680 => {
      const _0xd08edb = _0x27790c.target && _0x3e7680.pendienteId && _0x27790c.target.pendiente.items.find(_0x41faa6 => _0x41faa6.id === _0x3e7680.pendienteId && _0x41faa6.textoLibre);
      return "\n      <div class=\"chat-bubble " + (/guardad|confirmad|enviad|vaciad|Asociado/i.test(_0x3e7680.texto) ? "chat-bubble-accent" : "") + "\">\n        " + _0x1d1ab0(_0x3e7680.texto) + "\n        <div class=\"chat-bubble-meta\">" + _0x3e7680.ts + (_0x3e7680.usuario ? " · " + _0x1d1ab0(_0x3e7680.usuario) : "") + "</div>\n        " + (_0xd08edb && _0x27790c.puedeAsociar ? "<button class=\"cam-btn\" data-asociar-chat=\"" + _0x3e7680.pendienteId + "\" style=\"margin-top:6px; padding:6px 10px; font-size:11px; min-height:auto;\">Asociar</button>" : "") + "\n      </div>\n    ";
    }).join("") + "</div>";
  }
  function _0x529094() {
    // Cada entrega lleva la firma como imagen (hasta ~30 KB): con más de 30 el documento se acerca al límite de 1 MB de Firestore
    if (estado.deliveries.length > 30) {
      const _0x34a3aa = estado.deliveries.slice(25);
      estado.deliveries = estado.deliveries.slice(0, 25);
      _0x167040(_0x34a3aa);
    }
    const local = estado.deliveries;
    guardarFusionado("deliveries", local, servidor => TecnomatDatos.fusionarPorId(servidor, local), valor => {
      if (estado.deliveries === local) {
        estado.deliveries = valor;
      }
    });
  }
  async function _0x167040(_0x4f9e48) {
    const _0x53d81a = _0x4f9e48.map(_0x3e664a => ({
      groupKind: _0x3e664a.groupKind,
      groupName: _0x3e664a.groupName,
      requesterName: _0x3e664a.requesterName,
      recipientName: _0x3e664a.recipientName,
      confirmadoPor: _0x3e664a.confirmadoPor || "",
      lineas: _0x3e664a.items.length,
      ts: _0x3e664a.ts,
      tsMs: _0x3e664a.tsMs
    }));
    const _0x413d06 = (await _0x31ceb4("deliveries_archive")) || [];
    const _0x56bff6 = _0x413d06.concat(_0x53d81a).sort((_0x510ef9, _0x3ff94a) => (_0x3ff94a.tsMs || 0) - (_0x510ef9.tsMs || 0));
    estado.deliveriesArchive = _0x56bff6;
    guardar("deliveries_archive", _0x56bff6);
  }
  function guardarAvisos() {
    guardar("notifications", estado.notifications.slice(0, 100));
  }
  function _0x18572f() {
    guardar("ubicaciones", estado.ubicaciones);
  }
  async function _0x48754b() {
    if (!backend.getMaterialesRapidos) {
      return;
    }
    try {
      estado.materialesRapidos = await backend.getMaterialesRapidos();
      render();
    } catch (_0x30b6eb) {}
  }
  async function _0x1bf731(_0x3f384f, _0x594734) {
    _0x594734 = (_0x594734 || "").trim();
    if (!_0x594734) {
      _0x279f78("Escribe un nombre para el material.");
      return;
    }
    if (!backend.addMaterialRapido) {
      _0x279f78("Esto necesita Supabase configurado — ver README.");
      return;
    }
    try {
      await backend.addMaterialRapido(_0x3f384f.trim(), _0x594734, estado.materialesRapidos.length);
      await _0x48754b();
      _0x279f78("Añadido a la lista rápida.");
    } catch (_0xfcb7e7) {
      _0x279f78("No se pudo añadir: " + _0xfcb7e7.message);
    }
  }
  async function _0x311314(_0x1f9bd9) {
    if (!(await _0x2cc777("¿Quitar este material de la lista rápida?"))) {
      return;
    }
    if (!backend.deleteMaterialRapido) {
      return;
    }
    try {
      await backend.deleteMaterialRapido(_0x1f9bd9);
      await _0x48754b();
    } catch (_0x5dd464) {
      _0x279f78("No se pudo quitar: " + _0x5dd464.message);
    }
  }
  function _0x1a6410(_0x7e0897) {
    _0x7e0897 = (_0x7e0897 || "").trim();
    if (!_0x7e0897) {
      return;
    }
    if (estado.ubicaciones.some(_0x47e6a5 => _0x47e6a5.toLowerCase() === _0x7e0897.toLowerCase())) {
      _0x279f78("Esa ubicación ya está en la lista.");
      return;
    }
    estado.ubicaciones.push(_0x7e0897);
    estado.ubicaciones.sort((_0x4c2cdb, _0x547e0d) => _0x4c2cdb.localeCompare(_0x547e0d));
    _0x18572f();
    render();
  }
  async function _0x401198(_0x4d4d0b) {
    if (!(await _0x2cc777("¿Quitar \"" + _0x4d4d0b + "\" de la lista de ubicaciones? Los materiales que ya la tengan puesta no se tocan, solo deja de aparecer para autocompletar."))) {
      return;
    }
    estado.ubicaciones = estado.ubicaciones.filter(_0x59384f => _0x59384f !== _0x4d4d0b);
    _0x18572f();
    render();
  }
  function _0x3131a5() {
    if (!estado.deliveries.length) {
      _0x279f78("Todavía no hay entregas firmadas.");
      return;
    }
    const _0x2444f7 = [];
    estado.deliveries.forEach(_0x19211d => {
      _0x19211d.items.forEach(_0x29b13b => {
        _0x2444f7.push({
          Fecha: _0x19211d.ts,
          Origen: (_0x19211d.groupKind === "montaje" ? "Montaje/Venta: " : "Proyecto: ") + (_0x19211d.groupName || ""),
          "Pedido por": _0x19211d.requesterName || "",
          "Recogido por": _0x19211d.recipientName || "",
          Código: _0x29b13b.code,
          Referencia: _0x29b13b.desc,
          Cantidad: _0x29b13b.qty
        });
      });
    });
    const _0x41397d = XLSX.utils.book_new();
    const _0xd1da99 = _0x5dc8ea(_0x2444f7, {
      Fecha: "",
      "Recibido por": "",
      Código: "",
      Referencia: "",
      Cantidad: ""
    });
    XLSX.utils.book_append_sheet(_0x41397d, _0xd1da99, "Entregas firmadas");
    XLSX.writeFile(_0x41397d, "entregas_firmadas_" + Date.now() + ".xlsx");
  }
  function _0x37360d() {
    guardar("settings", estado.settings);
  }
  function _0x5a6d71() {
    guardar("alerts_state", estado.alerts);
  }
  function _0x1ea037() {
    if (estado.mode === "montaje" || estado.mode === "proyecto") {
      const _0x46a326 = estado.current[estado.mode];
      if (!_0x46a326) {
        return null;
      }
      return estado.groupData[estado.mode + "::" + _0x46a326] || null;
    }
    return null;
  }
  function _0x29f0a4() {
    const _0xf54fd2 = estado.current[estado.mode];
    if (_0xf54fd2) {
      guardarGrupo(estado.mode, _0xf54fd2);
    }
  }
  function _0x10a3a1() {
    if (estado.mode === "montaje") {
      return "Montaje/Venta: " + (estado.current.montaje || "");
    }
    if (estado.mode === "proyecto") {
      return "Proyecto: " + (estado.current.proyecto || "");
    }
    return "Almacén";
  }
  function buscarPorCodigo(_0xc778f7) {
    return estado.catalog.find(_0x179bbc => _0x179bbc.code.toLowerCase() === _0xc778f7.toLowerCase());
  }
  function _0xdcb31c(_0x59f809) {
    return estado.catalog.filter(_0x23f327 => _0x23f327.code.toLowerCase() === _0x59f809.toLowerCase());
  }
  function _0x12054f(_0x56b120, _0x27d5d8, _0x2b7c01, _0x1953ed, _0x4fa1e6) {
    const _0x38ae4c = {
      id: nuevoId(),
      code: _0x56b120,
      desc: _0x27d5d8,
      qty: 0,
      location: _0x2b7c01 || "",
      categoria: _0x1953ed || "",
      specs: "",
      marca: "",
      referencia: _0x4fa1e6 || ""
    };
    estado.catalog.push(_0x38ae4c);
    guardarCatalogo();
    return _0x38ae4c;
  }
  // Ajustes de stock pendientes de llegar al servidor. Se guardan en el dispositivo para que, sin cobertura
  // o si se cierra la app, no se pierdan: se envían en orden en cuanto hay conexión.
  // shortcut: si la conexión se corta justo después de aplicarse en el servidor, ese ajuste se reenvía y cuenta dos veces; muy raro, revisar si aparecen descuadres
  const CLAVE_STOCK_PENDIENTE = "tecnomat_stock_pendiente";
  const leerAjustesPendientes = () => {
    try {
      return JSON.parse(localStorage.getItem(CLAVE_STOCK_PENDIENTE)) || [];
    } catch (e) {
      return [];
    }
  };
  const escribirAjustesPendientes = lista => {
    try {
      localStorage.setItem(CLAVE_STOCK_PENDIENTE, JSON.stringify(lista));
    } catch (e) {}
  };
  function encolarAjusteStock(articulo, delta) {
    escribirAjustesPendientes([...leerAjustesPendientes(), { id: nuevoId(), articulo: Object.assign({}, articulo), delta }]);
    enviarAjustesPendientes();
  }
  let enviandoAjustes = null;
  function enviarAjustesPendientes() {
    if (!hayBackend || !navigator.onLine) {
      avisarAjustesPendientes();
      return enviandoAjustes;
    }
    if (!enviandoAjustes) {
      enviandoAjustes = (async () => {
        let pendientes;
        while ((pendientes = leerAjustesPendientes()).length) {
          const ajuste = pendientes[0];
          try {
            await backend.adjustStockAtomic(ajuste.articulo, ajuste.delta);
          } catch (e) {
            avisarAjustesPendientes();
            break;
          }
          escribirAjustesPendientes(leerAjustesPendientes().filter(x => x.id !== ajuste.id));
        }
      })().finally(() => {
        enviandoAjustes = null;
      });
    }
    return enviandoAjustes;
  }
  function avisarAjustesPendientes() {
    const n = leerAjustesPendientes().length;
    if (n) {
      _0x279f78("Sin conexión: " + n + " ajuste" + (n === 1 ? "" : "s") + " de stock guardado" + (n === 1 ? "" : "s") + " en este dispositivo. Se enviará" + (n === 1 ? "" : "n") + " solo" + (n === 1 ? "" : "s") + " al volver la conexión; no cierres sesión.");
    }
  }
  window.addEventListener("online", () => enviarAjustesPendientes());
  function _0x1d4277(_0x8de593, _0x12b1fc, _0x1bb957, _0x536686) {
    const _0x549810 = _0x1bb957 === "entrada" ? _0x12b1fc : -_0x12b1fc;
    _0x8de593.qty += _0x549810;
    estado.movements.unshift({
      id: nuevoId(),
      code: _0x8de593.code,
      desc: _0x8de593.desc,
      qty: _0x12b1fc,
      type: _0x1bb957,
      origin: _0x536686,
      ts: fechaHoraTexto(),
      tsMs: Date.now(),
      usuario: usuarioActual()
    });
    _0x240f8a();
    if (hayBackend) {
      encolarAjusteStock(_0x8de593, _0x549810);
    } else {
      guardarCatalogo();
    }
  }
  async function _0x4fac24(_0x3e59b5) {
    const _0x39adc4 = estado.catalog.find(_0x255dc6 => _0x255dc6.id === _0x3e59b5);
    if (!_0x39adc4) {
      return;
    }
    const _0x2d5250 = await _0x3b375f("Nueva cantidad para " + _0x39adc4.code + " — " + _0x39adc4.desc, _0x39adc4.qty);
    if (_0x2d5250 === null) {
      return;
    }
    const _0x5ae73b = Math.max(0, parseInt(_0x2d5250, 10) || 0);
    const _0x1a6ca7 = _0x5ae73b - _0x39adc4.qty;
    if (_0x1a6ca7 === 0) {
      return;
    }
    _0x1d4277(_0x39adc4, Math.abs(_0x1a6ca7), _0x1a6ca7 > 0 ? "entrada" : "salida", "Almacén (ajuste manual de cantidad)");
    render();
  }
  async function _0x291d0f(_0x3af321) {
    const _0xbf5205 = estado.catalog.find(_0x59c1fc => _0x59c1fc.id === _0x3af321);
    if (!_0xbf5205) {
      return;
    }
    const _0x3dcd37 = _0x23f5f6.map((_0xd255f3, _0x90389b) => _0x90389b + 1 + ". " + _0xd255f3).join("\n");
    const _0x22428a = await _0x3b375f("Categoría para " + _0xbf5205.code + " — " + _0xbf5205.desc + ":\n\n" + _0x3dcd37 + "\n\nEscribe el número, el nombre exacto, o déjalo en blanco para quitarla.", _0xbf5205.categoria || "");
    if (_0x22428a == null) {
      return;
    }
    const _0x840297 = _0x22428a.trim();
    if (!_0x840297) {
      _0xbf5205.categoria = "";
    } else {
      const _0x24456f = _0x23f5f6[parseInt(_0x840297, 10) - 1];
      const _0x42dd40 = _0x23f5f6.find(_0x3ad338 => _0x3ad338.toLowerCase() === _0x840297.toLowerCase());
      _0xbf5205.categoria = _0x24456f || _0x42dd40 || _0x840297;
    }
    guardarCatalogo();
    render();
  }
  let _0x16ea10 = null;
  function _0x243f07(_0x46b0d8) {
    _0x16ea10 = _0x46b0d8;
    _0x433216();
  }
  function _0x34a315() {
    _0x16ea10 = null;
    $("#editItemOverlay").style.display = "none";
  }
  function _0x433216() {
    const _0x554368 = $("#editItemOverlay");
    const _0x298adb = estado.catalog.find(_0x27809a => _0x27809a.id === _0x16ea10);
    if (!_0x298adb) {
      _0x554368.style.display = "none";
      return;
    }
    const _0x4d3721 = $("#editItemCard");
    _0x4d3721.innerHTML = "\n      <p class=\"panel-title\">Editar " + _0x1d1ab0(_0x298adb.code) + "</p>\n      <div class=\"manual-stock-form\" style=\"margin-top:0; flex-direction:column;\">\n        <input type=\"text\" id=\"editArticulo\" placeholder=\"Artículo\" value=\"" + _0x1d1ab0(_0x298adb.desc) + "\" style=\"width:100%;\">\n        <input type=\"text\" id=\"editReferencia\" placeholder=\"Referencia (opcional)\" value=\"" + _0x1d1ab0(_0x298adb.referencia || "") + "\" style=\"width:100%;\">\n        <input type=\"text\" id=\"editUbicacion\" placeholder=\"Ubicación\" value=\"" + _0x1d1ab0(_0x298adb.location || "") + "\" list=\"ubicacionesList\" style=\"width:100%;\">\n        <select id=\"editCategoria\" style=\"width:100%;\">\n          <option value=\"\">Sin categoría</option>\n          " + _0x23f5f6.map(_0x361584 => "<option value=\"" + _0x1d1ab0(_0x361584) + "\" " + (_0x298adb.categoria === _0x361584 ? "selected" : "") + ">" + _0x1d1ab0(_0x361584) + "</option>").join("") + "\n        </select>\n        <input type=\"number\" id=\"editCoste\" placeholder=\"Coste por unidad (€)\" value=\"" + (_0x298adb.coste || 0) + "\" min=\"0\" step=\"0.01\" style=\"width:100%;\">\n        <textarea id=\"editSpecs\" placeholder=\"Características (opcional)\" style=\"width:100%; min-height:60px; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:9px 10px; border-radius:7px; font-size:13px; font-family:inherit;\">" + _0x1d1ab0(_0x298adb.specs || "") + "</textarea>\n      </div>\n      <div class=\"backup-row\" style=\"margin-top:12px;\">\n        <button class=\"btn primary\" id=\"saveEditItemBtn\" style=\"width:auto; flex:1;\">" + _0x56ae2b("guardar") + "Guardar</button>\n        <button class=\"cam-btn\" id=\"cancelEditItemBtn\" style=\"flex:none;\">Cancelar</button>\n      </div>\n      <div class=\"scanner-row\" style=\"margin-top:10px; padding-top:10px; border-top:1px dashed var(--border);\">\n        <button class=\"cam-btn\" id=\"editItemEtiquetaBtn\" style=\"flex:1; padding:8px 10px; font-size:12px; min-height:auto;\">Imprimir etiqueta</button>\n        <button class=\"cam-btn\" id=\"editItemDupBtn\" style=\"flex:1; padding:8px 10px; font-size:12px; min-height:auto;\">+ Otra referencia</button>\n        <button class=\"btn-return\" id=\"editItemDelBtn\" style=\"flex:1; padding:8px 10px; font-size:12px; min-height:auto;\">" + _0x56ae2b("eliminar") + "Eliminar</button>\n      </div>\n    ";
    _0x554368.style.display = "flex";
    $("#saveEditItemBtn").addEventListener("click", _0x12cde8);
    $("#cancelEditItemBtn").addEventListener("click", _0x34a315);
    $("#editItemEtiquetaBtn").addEventListener("click", () => __etiquetaRapida(_0x298adb.id));
    $("#editItemDupBtn").addEventListener("click", () => {
      _0x34a315();
      _0x1dfbd0 = null;
      _0x24edec = {
        code: _0x298adb.code
      };
      _0x279f78("Rellena la nueva referencia para el código \"" + _0x298adb.code + "\" justo arriba, junto al escáner.");
      render();
    });
    $("#editItemDelBtn").addEventListener("click", () => {
      _0x34a315();
      _0x323ac8(_0x298adb.id);
    });
    $("#editArticulo").focus();
  }
  function _0x12cde8() {
    const _0x171a74 = estado.catalog.find(_0x2b83a2 => _0x2b83a2.id === _0x16ea10);
    if (!_0x171a74) {
      return;
    }
    const _0x449ce0 = $("#editArticulo").value.trim();
    if (!_0x449ce0) {
      _0x279f78("El artículo no puede quedar vacío.");
      return;
    }
    _0x171a74.desc = _0x449ce0;
    _0x171a74.referencia = $("#editReferencia").value.trim();
    _0x171a74.location = $("#editUbicacion").value.trim();
    _0x171a74.categoria = $("#editCategoria").value;
    const _0x1d2afd = parseFloat($("#editCoste").value);
    _0x171a74.coste = isNaN(_0x1d2afd) ? 0 : Math.max(0, _0x1d2afd);
    _0x171a74.specs = $("#editSpecs").value.trim();
    guardarCatalogo();
    _0x34a315();
    render();
  }
  let _0xd99011 = null;
  function _0x46a074() {
    if (typeof Tesseract !== "undefined") {
      return Promise.resolve();
    }
    if (_0xd99011) {
      return _0xd99011;
    }
    _0xd99011 = new Promise((_0x3f7d40, _0x4daea0) => {
      const _0xca168 = document.createElement("script");
      _0xca168.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";
      _0xca168.onload = () => _0x3f7d40();
      _0xca168.onerror = () => _0x4daea0(new Error("No se pudo cargar el reconocimiento de texto"));
      document.head.appendChild(_0xca168);
    });
    return _0xd99011;
  }
  let _0x3754f2 = null;
  function _0x12644a() {
    if (typeof window.jspdf !== "undefined") {
      return Promise.resolve();
    }
    if (_0x3754f2) {
      return _0x3754f2;
    }
    _0x3754f2 = new Promise((_0x337604, _0x3b2a73) => {
      const _0x43d661 = document.createElement("script");
      _0x43d661.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
      _0x43d661.onload = () => _0x337604();
      _0x43d661.onerror = () => _0x3b2a73(new Error("No se pudo cargar el generador de PDF"));
      document.head.appendChild(_0x43d661);
    });
    return _0x3754f2;
  }
  async function _0x323ac8(_0x183bc5) {
    const _0x48c987 = estado.catalog.find(_0x4d9fe9 => _0x4d9fe9.id === _0x183bc5);
    if (!_0x48c987) {
      return;
    }
    const _0x197090 = _0x48c987.qty > 0 ? "¿Eliminar \"" + _0x48c987.code + " — " + _0x48c987.desc + "\" del stock? Todavía tiene " + _0x48c987.qty + " unidades registradas. Esta acción no se puede deshacer." : "¿Eliminar \"" + _0x48c987.code + " — " + _0x48c987.desc + "\" del stock? Esta acción no se puede deshacer.";
    if (!(await _0x2cc777(_0x197090))) {
      return;
    }
    estado.movements.unshift({
      id: nuevoId(),
      code: _0x48c987.code,
      desc: _0x48c987.desc,
      qty: _0x48c987.qty,
      type: "eliminado",
      origin: "Almacén (referencia eliminada)",
      ts: fechaHoraTexto(),
      tsMs: Date.now(),
      usuario: usuarioActual()
    });
    _0x240f8a();
    estado.catalog = estado.catalog.filter(_0x15ffdf => _0x15ffdf.id !== _0x183bc5);
    guardarCatalogo();
    render();
  }
  function _0x3af2da(_0xa3199e, _0x521b7f, _0x41925f, _0x41263d) {
    _0xa3199e = _0xa3199e.trim();
    _0x521b7f = _0x521b7f.trim();
    _0x41925f = _0x41925f.trim();
    if (!_0xa3199e || !_0x521b7f || !_0x41925f || !_0x41263d) {
      _0x279f78("Rellena código, referencia, matrícula y fecha de devolución.");
      return;
    }
    estado.bobinas.push({
      id: nuevoId(),
      codigo: _0xa3199e,
      desc: _0x521b7f,
      matricula: _0x41925f,
      expira: _0x41263d,
      createdAt: fechaHoraTexto()
    });
    _0x217fa8();
    if (!buscarPorCodigo(_0xa3199e)) {
      estado.catalog.push({
        id: nuevoId(),
        code: _0xa3199e,
        desc: _0x521b7f,
        qty: 0,
        location: ""
      });
      guardarCatalogo();
    }
    render();
  }
  async function _0x5d5280(_0x1886f4) {
    if (!(await _0x2cc777("¿Eliminar esta bobina del registro?"))) {
      return;
    }
    estado.bobinas = estado.bobinas.filter(_0x4942cf => _0x4942cf.id !== _0x1886f4);
    _0x217fa8();
    render();
  }
  function _0x57856f(_0x31a757, _0x33d8a6) {
    const _0x3c0e03 = estado.pedidoItems.find(_0xe28dda => _0xe28dda.itemId ? _0xe28dda.itemId === _0x31a757.id : _0xe28dda.code.toLowerCase() === _0x31a757.code.toLowerCase());
    if (_0x3c0e03) {
      _0x3c0e03.qty += _0x33d8a6;
      if (!_0x3c0e03.itemId) {
        _0x3c0e03.itemId = _0x31a757.id;
      }
    } else {
      estado.pedidoItems.push({
        id: nuevoId(),
        itemId: _0x31a757.id,
        code: _0x31a757.code,
        desc: _0x31a757.desc,
        qty: _0x33d8a6
      });
    }
    anadirMensajeChat(estado.pedidoChat, "Escaneado: " + _0x31a757.code + " — " + _0x31a757.desc + " · " + _0x33d8a6 + " uds (pide: " + estado.pedidoRequesterName + ")");
    _0x2fa0b5();
    _0x253c4d();
    render();
  }
  async function _0x36610a() {
    if (!(await _0x30b7a6())) {
      return;
    }
    const _0xe16a60 = $("#chatMensajeInput");
    const _0x4f28d5 = $("#chatCantidadInput");
    const _0x3469f0 = _0xe16a60.value.trim();
    if (!_0x3469f0) {
      _0x279f78("Escribe qué hace falta antes de enviar.");
      return;
    }
    const _0x2c79f7 = Math.max(1, parseInt(_0x4f28d5.value, 10) || 1);
    estado.pedidoItems.push({
      id: nuevoId(),
      itemId: null,
      code: "",
      desc: _0x3469f0,
      qty: _0x2c79f7
    });
    anadirMensajeChat(estado.pedidoChat, "Pedido: " + _0x3469f0 + " · " + _0x2c79f7 + " uds (pide: " + estado.pedidoRequesterName + ")");
    __clasifLimpiarChat();
    _0x2fa0b5();
    _0x253c4d();
    render();
  }
  function _0x10dfbf(_0x2f08e8) {
    const _0x4708ef = estado.pedidoItems.find(_0x303427 => _0x303427.id === _0x2f08e8);
    estado.pedidoItems = estado.pedidoItems.filter(_0xa123a8 => _0xa123a8.id !== _0x2f08e8);
    if (_0x4708ef) {
      anadirMensajeChat(estado.pedidoChat, "Quitado del pedido: " + _0x4708ef.code + " — " + _0x4708ef.desc);
    }
    _0x2fa0b5();
    _0x253c4d();
    render();
  }
  async function _0x26d93b() {
    if (!estado.pedidoItems.length) {
      return;
    }
    if (!(await _0x2cc777("¿Vaciar el pedido? Se perderá el listado actual."))) {
      return;
    }
    estado.pedidoItems = [];
    anadirMensajeChat(estado.pedidoChat, "Pedido vaciado");
    _0x2fa0b5();
    _0x253c4d();
    render();
  }
  async function _0x59a0b6() {
    if (!estado.pedidoItems.length) {
      _0x279f78("El pedido está vacío, añade algún material primero.");
      return;
    }
    if (!_0x172e48 || !estado.settings.emailDestino) {
      _0x279f78("Configura el correo de EmailJS y el email de destino (en Almacén → Avisos) antes de poder enviar el pedido.");
      return;
    }
    if (!(await _0x2cc777("¿Enviar este pedido por correo? El listado se vaciará después de enviarlo."))) {
      return;
    }
    let _0x4f080c = "Pedido de materiales solicitado:\n\n";
    estado.pedidoItems.forEach(_0xfa5d2e => {
      _0x4f080c += "- " + _0xfa5d2e.code + " · " + _0xfa5d2e.desc + " · " + _0xfa5d2e.qty + " uds\n";
    });
    enviarCorreoAviso("Pedido de materiales", _0x4f080c);
    estado.pedidoItems = [];
    _0x253c4d();
    _0x279f78("Pedido enviado por correo.");
    render();
  }
  function _0x1e1e26() {
    const _0x3e2c92 = _0x1ea037();
    if (!_0x3e2c92) {
      return;
    }
    _0x3e2c92.pendiente.items.forEach(_0x341cc5 => {
      _0x341cc5.guardado = true;
      _0x341cc5.fechaGuardado = fechaHoraTexto();
    });
    anadirMensajeChat(_0x3e2c92.chat, "Hoja de pedido guardada y avisada a almacén (" + _0x3e2c92.pendiente.items.length + " línea(s))");
    _0x29f0a4();
    if (_0x3e2c92.pendiente.items.length) {
      const _0x2f3f1a = estado.current[estado.mode];
      const _0x142f57 = buscarGrupo(estado.mode, _0x2f3f1a);
      const _0x5b3cbf = _0x142f57 && _0x142f57.tipo ? " (" + _0x142f57.tipo + ")" : "";
      let _0x593dad = "Pedido de materiales guardado en " + (estado.mode === "montaje" ? "Montaje/Venta" : "Proyecto") + " \"" + _0x2f3f1a + "\"" + _0x5b3cbf + ":\n\n";
      _0x3e2c92.pendiente.items.forEach(_0x2158a8 => {
        _0x593dad += "- " + _0x2158a8.code + " · " + _0x2158a8.desc + " · Cantidad: " + _0x2158a8.qty + " · Pedido: " + (_0x2158a8.pedido ?? _0x2158a8.qty) + " · Reserva: " + (_0x2158a8.reserva ?? 0) + "\n";
      });
      _0x593dad += "\nPedido por: " + (_0x3e2c92.pendiente.requesterName || "sin especificar");
      enviarCorreoAviso("Nuevo pedido de materiales — " + _0x2f3f1a, _0x593dad);
      estado.notifications.unshift({
        id: nuevoId(),
        groupKind: estado.mode,
        groupName: _0x2f3f1a,
        requesterName: _0x3e2c92.pendiente.requesterName || "sin especificar",
        tipo: _0x142f57 ? _0x142f57.tipo || "" : "",
        lineas: _0x3e2c92.pendiente.items.length,
        ts: fechaHoraTexto(),
        tsMs: Date.now(),
        leida: false
      });
      guardarAvisos();
    }
    _0x279f78("Pedido guardado" + (_0x172e48 && estado.settings.emailDestino ? " y aviso enviado a almacén." : "."));
    render();
  }
  function _0x308988() {
    const _0xd138f7 = _0x1ea037();
    if (!_0xd138f7 || !__hojaLineasLista(_0xd138f7).length) {
      _0x279f78("La solicitud está vacía, añade algún material primero.");
      return;
    }
    const _0x2855cb = [];
    __hojaLineasLista(_0xd138f7).forEach(_0x2864cb => {
      if (__clasifLinea(_0x2864cb).tipo === "externo") {
        return;
      }
      const _0x463110 = _0x2864cb.itemId ? estado.catalog.find(_0x4a2124 => _0x4a2124.id === _0x2864cb.itemId) : buscarPorCodigo(_0x2864cb.code);
      const _0x5e78a4 = _0x463110 ? _0x463110.qty : 0;
      if (_0x5e78a4 < _0x2864cb.qty) {
        _0x2855cb.push(_0x2864cb.code + " — " + _0x2864cb.desc + " (pedidas " + _0x2864cb.qty + ", solo hay " + _0x5e78a4 + ")");
      }
    });
    if (_0x2855cb.length) {
      __ofrecerExterno(_0xd138f7);
      return;
    }
    __hojaLineasLista(_0xd138f7).forEach(_0x2f5b81 => {
      _0x2f5b81.reservado = true;
    });
    _0x29f0a4();
    // El taller se entera de que su material está listo sin tener que preguntar
    estado.notifications.unshift({
      id: nuevoId(),
      para: "taller",
      groupKind: estado.mode,
      groupName: estado.current[estado.mode],
      requesterName: _0xd138f7.pendiente.requesterName || "",
      lineas: __hojaLineasLista(_0xd138f7).length,
      ts: fechaHoraTexto(),
      tsMs: Date.now(),
      leida: false
    });
    guardarAvisos();
    estado.pendingDelivery = {
      groupKind: estado.mode,
      groupName: estado.current[estado.mode],
      requesterName: _0xd138f7.pendiente.requesterName,
      items: __hojaLineasLista(_0xd138f7).map(_0x3120ee => ({
        id: _0x3120ee.id,
        texto: _0x3120ee.textoLibre || "",
        itemId: _0x3120ee.itemId,
        code: _0x3120ee.code,
        desc: _0x3120ee.desc,
        qty: _0x3120ee.qty,
        externo: __clasifLinea(_0x3120ee).tipo === "externo"
      })),
      recipientName: ""
    };
    render();
  }
  function _0x59f3bd() {
    if (estado.pendingDelivery) {
      const _0x7ced69 = estado.groupData[estado.pendingDelivery.groupKind + "::" + estado.pendingDelivery.groupName];
      if (_0x7ced69) {
        _0x7ced69.pendiente.items.forEach(_0x2b4c04 => {
          _0x2b4c04.reservado = false;
        });
        guardar("group_" + estado.pendingDelivery.groupKind + "_" + aSlug(estado.pendingDelivery.groupName), _0x7ced69);
      }
    }
    estado.pendingDelivery = null;
    _0x1abbb2();
    render();
  }
  function _0x28a554(_0x88fbb) {
    if (!estado.pendingDelivery) {
      return;
    }
    const _0x3fddd3 = estado.pendingDelivery.groupKind + "::" + estado.pendingDelivery.groupName;
    const _0x2546c8 = estado.groupData[_0x3fddd3];
    if (!_0x2546c8) {
      _0x279f78("La orden/proyecto de esta solicitud ya no existe.");
      estado.pendingDelivery = null;
      _0x1abbb2();
      render();
      return;
    }
    const _0x4303ac = [];
    estado.pendingDelivery.items.forEach(_0x3dbca4 => {
      if (_0x3dbca4.externo) {
        return;
      }
      const _0x4e3c43 = _0x3dbca4.itemId ? estado.catalog.find(_0x45b401 => _0x45b401.id === _0x3dbca4.itemId) : buscarPorCodigo(_0x3dbca4.code);
      const _0x33780c = _0x4e3c43 ? _0x4e3c43.qty : 0;
      if (_0x33780c < _0x3dbca4.qty) {
        _0x4303ac.push(_0x3dbca4.code + " — " + _0x3dbca4.desc);
      }
    });
    if (_0x4303ac.length) {
      _0x279f78("Ya no hay stock suficiente de: " + _0x4303ac.join(", ") + ". Cancela y ajusta la solicitud.");
      return;
    }
    const _0x48bc68 = (estado.pendingDelivery.groupKind === "montaje" ? "Montaje/Venta: " : "Proyecto: ") + estado.pendingDelivery.groupName + " — pedido por " + (estado.pendingDelivery.requesterName || "sin especificar") + (estado.pendingDelivery.recipientName ? " — recogido por " + estado.pendingDelivery.recipientName : "");
    estado.pendingDelivery.items.forEach(_0x16b903 => {
      if (_0x16b903.externo) {
        __servirExterno(_0x2546c8, _0x16b903);
        return;
      }
      const _0x316fe3 = _0x16b903.itemId ? estado.catalog.find(_0x416daa => _0x416daa.id === _0x16b903.itemId) : buscarPorCodigo(_0x16b903.code);
      if (!_0x316fe3) {
        return;
      }
      _0x5c175f(_0x2546c8, _0x316fe3, _0x16b903.qty, {
        escandalloPedido: _0x16b903.escandalloPedido,
        escandalloPedidoNumero: _0x16b903.escandalloPedidoNumero
      });
      _0x1d4277(_0x316fe3, _0x16b903.qty, "salida", _0x48bc68);
    });
    anadirMensajeChat(_0x2546c8.chat, "Recogida confirmada y firmada por " + (estado.pendingDelivery.recipientName || "sin especificar") + " (" + estado.pendingDelivery.items.length + " línea(s))");
    _0x2546c8.pendiente = {
      requesterName: "",
      items: _0x2546c8.pendiente.items.filter(__l => !estado.pendingDelivery.items.some(__e => __e.id === __l.id))
    };
    guardar("group_" + estado.pendingDelivery.groupKind + "_" + aSlug(estado.pendingDelivery.groupName), _0x2546c8);
    estado.deliveries.unshift({
      id: nuevoId(),
      groupKind: estado.pendingDelivery.groupKind,
      groupName: estado.pendingDelivery.groupName,
      items: estado.pendingDelivery.items,
      requesterName: estado.pendingDelivery.requesterName,
      recipientName: estado.pendingDelivery.recipientName,
      signature: _0x88fbb,
      ts: fechaHoraTexto(),
      tsMs: Date.now(),
      confirmadoPor: usuarioActual()
    });
    _0x529094();
    estado.pendingDelivery = null;
    _0x1abbb2();
    render();
    _0x279f78("Recogida confirmada y firmada — stock descontado.");
  }
  function _0x1a6d34(_0x5c161c) {
    const _0x2d9449 = new Date();
    _0x2d9449.setHours(0, 0, 0, 0);
    const _0x10f917 = new Date(_0x5c161c + "T00:00:00");
    return Math.round((_0x10f917 - _0x2d9449) / 86400000);
  }
  function _0x3fdd17() {
    return estado.bobinas.filter(_0x5dad0e => _0x1a6d34(_0x5dad0e.expira) <= estado.settings.bobinaAvisoDias);
  }
  // Stock bajo. Un artículo a 0 que nunca ha tenido movimientos ni mínimo propio es que aún no se ha inventariado:
  // no se avisa de él (si no, el aviso lista casi todo el catálogo y nadie lo lee).
  function _0x41ba69() {
    const conMovimientos = new Set((estado.movements || []).map(m => m.code));
    return estado.catalog.filter(_0xd6c61b => _0xd6c61b.qty <= __clasifMinimo(_0xd6c61b) && (_0xd6c61b.qty > 0 || Number.isFinite(_0xd6c61b.minimo) || conMovimientos.has(_0xd6c61b.code)));
  }
  function _0x2269fd() {
    return new Date().toISOString().slice(0, 10);
  }
  function _0x11c4a1(_0x405492) {
    if (_0x405492 === "entrada") {
      return "Entrada";
    }
    if (_0x405492 === "salida") {
      return "Salida";
    }
    if (_0x405492 === "eliminado") {
      return "Eliminado";
    }
    return _0x405492;
  }
  function _0x5d7cfc() {
    const _0x3f7b91 = new Date();
    if (_0x3f7b91.getHours() < estado.settings.avisoHora) {
      return;
    }
    if (estado.alerts.lastDailyCheck === _0x2269fd()) {
      return;
    }
    const _0x8030f = _0x41ba69();
    const _0x3bf198 = _0x3fdd17();
    if (_0x8030f.length) {
      let _0x448b8f = "Materiales con " + estado.settings.stockBajoUmbral + " unidades o menos:\n\n";
      _0x8030f.forEach(_0x482954 => {
        _0x448b8f += "- " + _0x482954.code + " · " + _0x482954.desc + " · " + _0x482954.qty + " uds · ubicación: " + (_0x482954.location || "sin ubicar") + "\n";
      });
      if (_0x3bf198.length) {
        _0x448b8f += "\nBobinas a punto de expirar:\n\n";
        _0x3bf198.forEach(_0x3c3117 => {
          _0x448b8f += "- " + (_0x3c3117.codigo ? _0x3c3117.codigo + " · " : "") + _0x3c3117.desc + " · matrícula " + _0x3c3117.matricula + " · devolver antes del " + _0x3c3117.expira + "\n";
        });
      }
      enviarCorreoAviso("Aviso de stock bajo" + (_0x3bf198.length ? " y bobinas por expirar" : ""), _0x448b8f);
    } else if (_0x3bf198.length) {
      let _0x2c9dd3 = "Bobinas a punto de expirar:\n\n";
      _0x3bf198.forEach(_0x283ec3 => {
        _0x2c9dd3 += "- " + (_0x283ec3.codigo ? _0x283ec3.codigo + " · " : "") + _0x283ec3.desc + " · matrícula " + _0x283ec3.matricula + " · devolver antes del " + _0x283ec3.expira + "\n";
      });
      enviarCorreoAviso("Aviso: bobinas a punto de expirar", _0x2c9dd3);
    }
    const _0x5c7f10 = _0x4fc746();
    if (_0x5c7f10.length) {
      let _0x38991d = "Mantenimiento de vehículos pendiente:\n\n";
      _0x5c7f10.forEach(_0x2e3d8f => {
        _0x38991d += "- " + _0x2e3d8f.vehiculo + " — " + _0x2e3d8f.tarea + " · " + (_0x2e3d8f.estado === "atrasada" ? "ATRASADA" : "pronto") + "\n";
      });
      enviarCorreoAviso("Aviso: mantenimiento de vehículos pendiente", _0x38991d);
    }
    estado.alerts.lastDailyCheck = _0x2269fd();
    _0x5a6d71();
  }
  function _0x5c7e54(_0x3d7865) {
    const _0x116bc5 = Date.now() - _0x3d7865 * 86400000;
    const _0x5cf9fe = {};
    estado.movements.forEach(_0x321739 => {
      if (_0x321739.type === "eliminado") {
        return;
      }
      if (_0x321739.tsMs && _0x321739.tsMs < _0x116bc5) {
        return;
      }
      const _0x17805b = _0x321739.code + "|" + _0x321739.desc;
      _0x5cf9fe[_0x17805b] = (_0x5cf9fe[_0x17805b] || 0) + _0x321739.qty;
    });
    return Object.entries(_0x5cf9fe).sort((_0x39b233, _0x1797b6) => _0x1797b6[1] - _0x39b233[1]).slice(0, 5).map(([_0xd19596, _0x262626]) => {
      const [_0x5d7650, _0x4582f7] = _0xd19596.split("|");
      return {
        code: _0x5d7650,
        desc: _0x4582f7,
        total: _0x262626
      };
    });
  }
  function _0x27a88a() {
    const _0x11428c = _0x5c7e54(30);
    if (!_0x11428c.length) {
      return "<div style=\"color:var(--text-faint); font-size:12.5px;\">Todavía no hay movimientos suficientes.</div>";
    }
    const _0x392705 = Math.max(..._0x11428c.map(_0x150760 => _0x150760.total));
    return _0x11428c.map(_0x4ebd25 => "\n      <div style=\"margin-bottom:8px;\">\n        <div style=\"display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:2px;\">\n          <span style=\"color:var(--text-primary); font-weight:600;\">" + _0x1d1ab0(_0x4ebd25.code) + " · " + _0x1d1ab0(_0x4ebd25.desc) + "</span>\n          <span style=\"color:var(--text-faint);\">" + _0x4ebd25.total + " uds</span>\n        </div>\n        <div style=\"background:var(--bg-raised); border-radius:4px; height:6px; overflow:hidden;\">\n          <div style=\"background:var(--accent); height:100%; width:" + Math.max(4, Math.round(_0x4ebd25.total / _0x392705 * 100)) + "%;\"></div>\n        </div>\n      </div>\n    ").join("");
  }
  function _0x4b1425() {
    const _0x40a502 = new Date();
    if (_0x40a502.getHours() < estado.settings.avisoHora) {
      return;
    }
    if (estado.alerts.lastWeeklyCheckMs && Date.now() - estado.alerts.lastWeeklyCheckMs < 604800000) {
      return;
    }
    const _0x45b081 = _0x5c7e54(7);
    let _0x15ff6a = "Resumen semanal de almacén:\n\n";
    if (_0x45b081.length) {
      _0x15ff6a += "Materiales con más movimiento esta semana:\n";
      _0x45b081.forEach(_0x245c5a => {
        _0x15ff6a += "- " + _0x245c5a.code + " · " + _0x245c5a.desc + " · " + _0x245c5a.total + " uds movidas\n";
      });
    } else {
      _0x15ff6a += "No ha habido movimientos esta semana.\n";
    }
    _0x15ff6a += "\nReferencias con stock bajo ahora mismo: " + _0x41ba69().length + "\n";
    _0x15ff6a += "Bobinas a punto de expirar: " + _0x3fdd17().length + "\n";
    enviarCorreoAviso("Resumen semanal de almacén", _0x15ff6a);
    estado.alerts.lastWeeklyCheckMs = Date.now();
    _0x5a6d71();
  }
  function _0x5c175f(_0x515dc1, _0x1492d8, _0x4f3e7b, _0x10442d) {
    _0x10442d = _0x10442d || {};
    const _0x269eb6 = _0x515dc1.servido.find(_0x112fae => _0x112fae.itemId ? _0x112fae.itemId === _0x1492d8.id : _0x112fae.code.toLowerCase() === _0x1492d8.code.toLowerCase());
    if (_0x269eb6) {
      _0x269eb6.qty += _0x4f3e7b;
      _0x269eb6.ts = fechaHoraTexto();
      if (!_0x269eb6.itemId) {
        _0x269eb6.itemId = _0x1492d8.id;
      }
      if (_0x10442d.escandalloPedido) {
        _0x269eb6.escandalloPedido = _0x10442d.escandalloPedido;
      }
      if (_0x10442d.escandalloPedidoNumero) {
        _0x269eb6.escandalloPedidoNumero = _0x10442d.escandalloPedidoNumero;
      }
      if (_0x10442d.proveedor) {
        _0x269eb6.proveedor = _0x10442d.proveedor;
      }
    } else {
      const _0x6193da = fechaHoraTexto();
      _0x515dc1.servido.unshift({
        id: nuevoId(),
        itemId: _0x1492d8.id,
        code: _0x1492d8.code,
        desc: _0x1492d8.desc,
        qty: _0x4f3e7b,
        firstTs: _0x6193da,
        ts: _0x6193da,
        escandalloPedido: _0x10442d.escandalloPedido || "",
        escandalloPedidoNumero: _0x10442d.escandalloPedidoNumero || "",
        proveedor: _0x10442d.proveedor || ""
      });
    }
  }
  async function _0x27b2ef(_0x431c1b) {
    if (_0x2ff082) {
      return 1;
    }
    const _0x5909a2 = await _0x3b375f("¿Cuántas unidades de \"" + _0x431c1b + "\"?", "1");
    if (_0x5909a2 === null) {
      return null;
    }
    const _0x225ff4 = Math.max(1, parseInt(_0x5909a2, 10) || 1);
    if (_0x225ff4 >= 1000 && !(await _0x2cc777("Has escrito " + _0x225ff4 + " unidades de \"" + _0x431c1b + "\" — ¿es correcto? Cancelar si ha sido un despiste al teclear."))) {
      return null;
    }
    return _0x225ff4;
  }
  function _0xc5b186(_0x4b4fff, _0x24f4ae, _0x2f6851) {
    const _0x38d9c7 = _0x4b4fff.pendiente.items.find(_0x523de2 => _0x523de2.itemId === _0x24f4ae.id);
    if (_0x38d9c7) {
      _0x38d9c7.qty += _0x2f6851;
    } else {
      _0x4b4fff.pendiente.items.push({
        id: nuevoId(),
        itemId: _0x24f4ae.id,
        code: _0x24f4ae.code,
        desc: _0x24f4ae.desc,
        referencia: _0x24f4ae.referencia || "",
        qty: _0x2f6851,
        pedido: 0,
        reserva: 0
      });
    }
    anadirMensajeChat(_0x4b4fff.chat, "Escaneado: " + _0x24f4ae.code + " — " + _0x24f4ae.desc + " · " + _0x2f6851 + " uds");
  }
  async function _0x50972b() {
    const _0x5b8e68 = _0x1ea037();
    if (!_0x5b8e68) {
      return;
    }
    if (!(await _0x328b69(_0x5b8e68))) {
      return;
    }
    const _0x585dd7 = $("#mainList");
    const _0x3f02e5 = [..._0x585dd7.querySelectorAll(".rapido-check:checked")];
    if (!_0x3f02e5.length) {
      _0x279f78("Marca al menos un material de la lista rápida.");
      return;
    }
    let _0x4b4a40 = 0;
    _0x3f02e5.forEach(_0x5104f1 => {
      const _0x28a1be = _0x5104f1.dataset.rapidoId;
      const _0x15113c = estado.materialesRapidos.find(_0x5047bc => _0x5047bc.id === _0x28a1be);
      if (!_0x15113c) {
        return;
      }
      const _0x3874c2 = _0x585dd7.querySelector("[data-rapido-qty=\"" + _0x28a1be + "\"]");
      const _0x4b03ff = Math.max(1, parseInt(_0x3874c2.value, 10) || 1);
      const _0x4c6cb3 = _0x15113c.codigo ? buscarPorCodigo(_0x15113c.codigo) : null;
      const _0x23c329 = _0x4c6cb3 ? {
        id: nuevoId(),
        itemId: _0x4c6cb3.id,
        code: _0x4c6cb3.code,
        desc: _0x4c6cb3.desc,
        referencia: _0x4c6cb3.referencia || "",
        qty: _0x4b03ff,
        pedido: 0,
        reserva: 0
      } : {
        id: nuevoId(),
        itemId: null,
        code: "",
        desc: "",
        referencia: "",
        textoLibre: _0x15113c.nombre,
        qty: _0x4b03ff,
        pedido: 0,
        reserva: 0
      };
      _0x5b8e68.pendiente.items.push(_0x23c329);
      _0x4b4a40++;
    });
    if (!_0x4b4a40) {
      return;
    }
    anadirMensajeChat(_0x5b8e68.chat, "Añadido desde la lista rápida: " + _0x4b4a40 + " línea(s)");
    _0x29f0a4();
    render();
  }
  async function _0x1b4d13() {
    return __chatEnviar();
  }
  async function _0x3b5c75() {
    const _0x400a64 = _0x1ea037();
    if (!_0x400a64) {
      return;
    }
    if (!(await _0x328b69(_0x400a64))) {
      return;
    }
    const _0x24f59d = await _0x3b375f("Describe el material que hace falta (sin referencia):");
    if (!_0x24f59d || !_0x24f59d.trim()) {
      return;
    }
    const _0x4031f1 = await _0x3b375f("¿Cuántas unidades hacen falta?", "1");
    if (_0x4031f1 === null) {
      return;
    }
    const _0x428a63 = Math.max(1, parseInt(_0x4031f1, 10) || 1);
    const _0x2c798b = nuevoId();
    _0x400a64.pendiente.items.push({
      id: _0x2c798b,
      itemId: null,
      code: "",
      desc: "",
      referencia: "",
      textoLibre: _0x24f59d.trim(),
      qty: _0x428a63,
      pedido: 0,
      reserva: 0
    });
    anadirMensajeChat(_0x400a64.chat, "Pedido: " + _0x24f59d.trim() + " · " + _0x428a63 + " uds (sin referencia todavía)");
    _0x400a64.chat[_0x400a64.chat.length - 1].pendienteId = _0x2c798b;
    _0x29f0a4();
    render();
  }
  function _0x14693b(_0x183de2) {
    const _0x2da0af = _0x1ea037();
    if (!_0x2da0af) {
      return;
    }
    const _0x25bb21 = _0x2da0af.pendiente.items.find(_0x17f5a5 => _0x17f5a5.id === _0x183de2);
    if (!_0x25bb21) {
      return;
    }
    const _0x2802ef = async _0x251baf => {
      if (!_0x251baf || !_0x251baf.trim()) {
        return;
      }
      let _0x2de8ff = buscarPorCodigo(_0x251baf.trim());
      if (!_0x2de8ff) {
        if (!(await _0x2cc777("El código \"" + _0x251baf.trim() + "\" no existe todavía en el stock. ¿Darlo de alta ahora (con 0 unidades, se ajusta luego)?"))) {
          return;
        }
        const _0x2ab88c = (await _0x3b375f("Artículo para \"" + _0x251baf.trim() + "\":", _0x25bb21.textoLibre)) || _0x25bb21.textoLibre;
        _0x2de8ff = {
          id: nuevoId(),
          code: _0x251baf.trim(),
          desc: _0x2ab88c.trim(),
          qty: 0,
          location: "",
          specs: "",
          marca: "",
          referencia: "",
          categoria: "",
          coste: 0
        };
        estado.catalog.push(_0x2de8ff);
        guardarCatalogo();
      }
      _0x25bb21.itemId = _0x2de8ff.id;
      _0x25bb21.code = _0x2de8ff.code;
      _0x25bb21.desc = _0x2de8ff.desc;
      _0x25bb21.referencia = _0x2de8ff.referencia || "";
      __clasifAsociar(_0x25bb21, _0x2de8ff);
      delete _0x25bb21.textoLibre;
      anadirMensajeChat(_0x2da0af.chat, "Asociado a " + _0x2de8ff.code + " — " + _0x2de8ff.desc);
      _0x29f0a4();
      render();
      _0x279f78("Referencia asignada: " + _0x2de8ff.code + " — " + _0x2de8ff.desc);
    };
    _0x210142("Código de la referencia real para \"" + _0x25bb21.textoLibre + "\"").then(_0x2802ef);
  }
  async function _0x2d3f0d(_0xec7d50) {
    _0x1564f0();
    const _0x5e3c65 = _0xec7d50.code + " — " + _0xec7d50.desc;
    if (estado.mode === "almacen") {
      const _0x437a51 = await _0x27b2ef(_0x5e3c65);
      if (_0x437a51 === null) {
        return;
      }
      if (_0x345037 === "salida" && _0x437a51 > _0xec7d50.qty) {
        _0x279f78("Solo quedan " + _0xec7d50.qty + " unidad(es) de \"" + _0x5e3c65 + "\" — no se puede sacar más de eso.");
        return;
      }
      _0x1d4277(_0xec7d50, _0x437a51, _0x345037, "Almacén (escaneo)");
      if (!_0xec7d50.categoria) {
        _0x291d0f(_0xec7d50.id);
      }
      const _0x212e0a = _0x345037 === "entrada" ? "salida" : "entrada";
      _0x279f78((_0x345037 === "entrada" ? "Entrada registrada: +" : "Salida registrada: -") + _0x437a51 + " · " + _0x5e3c65, () => {
        _0x1d4277(_0xec7d50, _0x437a51, _0x212e0a, "Deshacer " + _0x345037);
        render();
      });
      render();
      return;
    }
    if (estado.mode === "pedido") {
      if (!(await _0x30b7a6())) {
        return;
      }
      const _0x582308 = await _0x27b2ef(_0x5e3c65);
      if (_0x582308 === null) {
        return;
      }
      _0x57856f(_0xec7d50, _0x582308);
      _0x279f78("Añadido al pedido: " + _0x582308 + " · " + _0x5e3c65, () => {
        const _0x4c8bc6 = estado.pedidoItems.find(_0x30e70d => _0x30e70d.itemId === _0xec7d50.id);
        if (!_0x4c8bc6) {
          return;
        }
        _0x4c8bc6.qty -= _0x582308;
        if (_0x4c8bc6.qty <= 0) {
          estado.pedidoItems = estado.pedidoItems.filter(_0x1ae049 => _0x1ae049 !== _0x4c8bc6);
        }
        _0x253c4d();
        render();
      });
      return;
    }
    if (_0xec7d50.qty <= 0) {
      _0x279f78("No se puede solicitar \"" + _0x5e3c65 + "\" — no queda stock (0 unidades). Dalo de alta en Almacén primero.");
      return;
    }
    const _0x3222e2 = _0x1ea037();
    if (!_0x3222e2) {
      return;
    }
    if (!(await _0x328b69(_0x3222e2))) {
      return;
    }
    const _0x2fc9a6 = await _0x27b2ef(_0x5e3c65);
    if (_0x2fc9a6 === null) {
      return;
    }
    if (_0x2fc9a6 > _0xec7d50.qty) {
      _0x279f78("Solo quedan " + _0xec7d50.qty + " unidad(es) de \"" + _0x5e3c65 + "\" en stock — no se puede pedir más de eso.");
      return;
    }
    _0xc5b186(_0x3222e2, _0xec7d50, _0x2fc9a6);
    _0x29f0a4();
    _0x279f78("Añadido a la solicitud: " + _0x2fc9a6 + " · " + _0x5e3c65, () => {
      const _0x910d8b = _0x3222e2.pendiente.items.find(_0x2607cf => _0x2607cf.itemId === _0xec7d50.id);
      if (!_0x910d8b) {
        return;
      }
      _0x910d8b.qty -= _0x2fc9a6;
      if (_0x910d8b.qty <= 0) {
        _0x3222e2.pendiente.items = _0x3222e2.pendiente.items.filter(_0x3b2eb2 => _0x3b2eb2 !== _0x910d8b);
      }
      _0x29f0a4();
      render();
    });
    render();
  }
  async function _0x1803b3(_0x23d0d4) {
    const _0x2ce812 = _0x23d0d4.trim();
    if (!_0x2ce812) {
      return;
    }
    _0x1dfbd0 = null;
    if (estado.mode === "montaje" || estado.mode === "proyecto") {
      const _0x3471b1 = _0x1ea037();
      if (!_0x3471b1) {
        _0x279f78("Selecciona " + (estado.mode === "montaje" ? "una orden de montaje" : "un proyecto") + " antes de escanear.");
        return;
      }
      const _0x32d1e5 = buscarGrupo(estado.mode, estado.current[estado.mode]);
      if (_0x32d1e5 && _0x32d1e5.status === "finalizado") {
        _0x279f78("Est" + (estado.mode === "montaje" ? "a orden está finalizada" : "e proyecto está finalizado") + ". Reactíval" + (estado.mode === "montaje" ? "a" : "o") + " para seguir registrando material.");
        return;
      }
    }
    const _0xb52eb3 = _0xdcb31c(_0x2ce812);
    if (_0xb52eb3.length === 0) {
      if (estado.mode === "almacen" || estado.mode === "pedido") {
        _0x24edec = {
          code: _0x2ce812
        };
        _0x323e0f();
      } else {
        const _0xbb82ac = _0x1ea037();
        if (!_0xbb82ac.pendiente.requesterName) {
          _0x279f78("Indica quién hace la solicitud (campo \"¿Quién lo pide?\" de arriba) antes de escanear.");
        } else {
          const _0x418630 = await _0x27b2ef(_0x2ce812);
          if (_0x418630 !== null) {
            _0xbb82ac.pendiente.items.push({
              id: nuevoId(),
              itemId: null,
              code: "",
              desc: "",
              referencia: "",
              textoLibre: _0x2ce812,
              qty: _0x418630,
              pedido: 0,
              reserva: 0
            });
            _0x29f0a4();
            _0x279f78("Añadido sin referencia: " + _0x418630 + " · \"" + _0x2ce812 + "\" — almacén le asignará la referencia real.");
            render();
          }
        }
      }
      $("#scanInput").value = "";
      $("#scanInput").focus({
        preventScroll: true
      });
      return;
    }
    if (_0xb52eb3.length === 1) {
      _0x24edec = null;
      _0x2d3f0d(_0xb52eb3[0]);
      $("#scanInput").value = "";
      $("#scanInput").focus({
        preventScroll: true
      });
      return;
    }
    _0x24edec = null;
    _0x1dfbd0 = {
      code: _0x2ce812,
      matches: _0xb52eb3.map(_0x1ea373 => _0x1ea373.id)
    };
    _0x323e0f();
    $("#scanInput").value = "";
    $("#scanInput").focus({
      preventScroll: true
    });
  }
  function _0x4192c8() {
    if (!_0x24edec) {
      return;
    }
    const _0x66f41c = $("#unknownDesc");
    const _0x43bc49 = (_0x66f41c.value || "").trim();
    if (!_0x43bc49) {
      _0x279f78("Escribe el artículo para el material.");
      return;
    }
    const _0x3d547a = $("#unknownRef");
    const _0x3dd7e0 = _0x3d547a ? (_0x3d547a.value || "").trim() : "";
    const _0x46e65d = $("#unknownLoc");
    const _0x59b2b7 = _0x46e65d ? (_0x46e65d.value || "").trim() : "";
    const _0x43ed61 = $("#unknownCategoria");
    const _0x58ad9c = _0x43ed61 ? _0x43ed61.value : "";
    const _0x24882c = _0x12054f(_0x24edec.code, _0x43bc49, _0x59b2b7, _0x58ad9c, _0x3dd7e0);
    _0x24edec = null;
    _0x2d3f0d(_0x24882c);
    $("#scanInput").focus({
      preventScroll: true
    });
  }
  function _0x1541af(_0x182b15, _0x4ed719) {
    const _0x4d2986 = _0x1ea037();
    if (!_0x4d2986) {
      return;
    }
    const _0x4a7d94 = _0x4d2986.servido.find(_0x14d07a => _0x14d07a.id === _0x182b15);
    if (!_0x4a7d94) {
      return;
    }
    const _0x57a4b8 = Math.min(Math.max(1, _0x4ed719), _0x4a7d94.qty);
    _0x4a7d94.qty -= _0x57a4b8;
    _0x4d2986.devuelto.unshift({
      code: _0x4a7d94.code,
      desc: _0x4a7d94.desc,
      qty: _0x57a4b8,
      deliveredAt: _0x4a7d94.firstTs || _0x4a7d94.ts,
      ts: fechaHoraTexto()
    });
    if (_0x4a7d94.qty <= 0) {
      _0x4d2986.servido = _0x4d2986.servido.filter(_0x18cd15 => _0x18cd15.id !== _0x182b15);
    }
    _0x29f0a4();
    const _0x2d49c7 = _0x4a7d94.itemId && estado.catalog.find(_0x57e281 => _0x57e281.id === _0x4a7d94.itemId) || buscarPorCodigo(_0x4a7d94.code);
    if (_0x2d49c7) {
      _0x1d4277(_0x2d49c7, _0x57a4b8, "entrada", _0x10a3a1() + " (devolución)");
    }
    render();
  }
  async function _0x17cb6c() {
    const _0x5a519f = _0x1ea037();
    if (!_0x5a519f) {
      return;
    }
    if (!(await _0x2cc777("¿Vaciar esta lista (servidos y devueltos)? Esta acción no se puede deshacer. El stock no se modificará."))) {
      return;
    }
    _0x5a519f.servido = [];
    _0x5a519f.devuelto = [];
    _0x29f0a4();
    render();
  }
  function _0x5a53db(_0x14fe3b, _0x3c54f7, _0x442c3d, _0x409e3f, _0x142dcd, _0x25d7ae) {
    _0x14fe3b = _0x14fe3b.trim();
    _0x3c54f7 = _0x3c54f7.trim();
    _0x409e3f = (_0x409e3f || "").trim();
    _0x25d7ae = (_0x25d7ae || "").trim();
    _0x442c3d = Math.max(1, parseInt(_0x442c3d, 10) || 0);
    if (!_0x14fe3b || !_0x3c54f7 || !_0x442c3d) {
      _0x279f78("Rellena código, artículo y una cantidad válida.");
      return;
    }
    let _0x132ee8 = buscarPorCodigo(_0x14fe3b);
    if (!_0x132ee8) {
      _0x132ee8 = _0x12054f(_0x14fe3b, _0x3c54f7, _0x409e3f, _0x142dcd, _0x25d7ae);
    } else if (!_0x132ee8.categoria && _0x142dcd) {
      _0x132ee8.categoria = _0x142dcd;
    }
    _0x1d4277(_0x132ee8, _0x442c3d, "entrada", "Almacén (manual)");
    if (!_0x132ee8.categoria) {
      _0x291d0f(_0x132ee8.id);
    }
    render();
  }
  function buscarGrupo(_0x930926, _0x31f5fb) {
    return estado.groups[_0x930926].find(_0x157a0 => _0x157a0.name === _0x31f5fb);
  }
  async function _0x2f0e01(_0x5a7091, _0x3915d9) {
    estado.current[_0x5a7091] = _0x3915d9 || null;
    _0x5592da = "chat";
    clearTimeout(_0x279f78._t);
    const _0x54fc7f = $("#statusBanner");
    if (_0x54fc7f) {
      _0x54fc7f.style.display = "none";
    }
    if (_0x3915d9) {
      const _0x57ba4d = _0x5a7091 + "::" + _0x3915d9;
      if (!estado.groupData[_0x57ba4d]) {
        const _0xe92912 = await _0x31ceb4("group_" + _0x5a7091 + "_" + aSlug(_0x3915d9));
        estado.groupData[_0x57ba4d] = _0xe92912 ? Object.assign(grupoVacio(), _0xe92912) : grupoVacio();
      }
      const _0x1b3be7 = estado.groupData[_0x57ba4d];
      if (_0x1b3be7 && _0x1b3be7.pendiente.items.length) {
        const _0x51e77e = _0x1b3be7.pendiente.items.reduce((_0x575887, _0xce2396) => _0x575887 + _0xce2396.qty, 0);
        _0x279f78("Esta " + (_0x5a7091 === "montaje" ? "orden" : "este proyecto") + " tiene " + _0x1b3be7.pendiente.items.length + " línea(s) sin recoger (" + _0x51e77e + " uds).");
      }
    }
    _0x430fb2();
    _0x4efabf();
    render();
  }
  async function _0xc78429(_0x3d9b4c, _0x2f23cf, _0x116c8c, _0x4c9719) {
    _0x2f23cf = _0x2f23cf.trim();
    if (!_0x2f23cf) {
      return;
    }
    if (!buscarGrupo(_0x3d9b4c, _0x2f23cf)) {
      estado.groups[_0x3d9b4c].push({
        name: _0x2f23cf,
        status: "activo",
        tipo: _0x4c9719 || ""
      });
      guardarListaGrupos(_0x3d9b4c);
    }
    const _0x3c6a3b = _0x3d9b4c + "::" + _0x2f23cf;
    if (!estado.groupData[_0x3c6a3b]) {
      estado.groupData[_0x3c6a3b] = grupoVacio();
    }
    if (_0x116c8c) {
      estado.groupData[_0x3c6a3b].pendiente.requesterName = _0x116c8c.trim();
    }
    guardarGrupo(_0x3d9b4c, _0x2f23cf);
    await _0x2f0e01(_0x3d9b4c, _0x2f23cf);
  }
  async function _0x55946d(_0xe1b3e2, _0x4c68dd) {
    const _0x2fd417 = buscarGrupo(_0xe1b3e2, _0x4c68dd);
    if (!_0x2fd417) {
      return;
    }
    const _0x2644b4 = _0x2fd417.status !== "finalizado";
    if (_0x2644b4) {
      const _0x34a0d9 = estado.groupData[_0xe1b3e2 + "::" + _0x4c68dd];
      const _0x207d6d = _0x34a0d9 ? _0x34a0d9.pendiente.items.length : 0;
      const _0xc28b62 = _0x207d6d ? "Todavía hay " + _0x207d6d + " línea(s) en la solicitud pendiente de recoger, sin firmar. Si finalizas ahora, es fácil que se quede olvidada. ¿Finalizar de todos modos?" : "¿Seguro que quieres finalizar \"" + _0x4c68dd + "\"? Se puede reactivar más tarde si hace falta.";
      if (!(await _0x2cc777(_0xc28b62))) {
        return;
      }
    } else if (!(await _0x2cc777("¿Reactivar \"" + _0x4c68dd + "\"? Volverá a aparecer como orden/proyecto activo."))) {
      return;
    }
    _0x2fd417.status = _0x2644b4 ? "finalizado" : "activo";
    guardarListaGrupos(_0xe1b3e2);
    render();
  }
  async function _0x2d4970(_0x28c730, _0x2dfdf9) {
    const _0x4fa642 = _0x535db1[_0x28c730];
    if (!(await _0x2cc777("¿Eliminar " + (_0x28c730 === "montaje" ? "la orden" : "el proyecto") + " \"" + _0x2dfdf9 + "\" y todo su material registrado? Esta acción no se puede deshacer."))) {
      return;
    }
    estado.groups[_0x28c730] = estado.groups[_0x28c730].filter(_0x128762 => _0x128762.name !== _0x2dfdf9);
    delete estado.groupData[_0x28c730 + "::" + _0x2dfdf9];
    guardarListaGrupos(_0x28c730);
    await _0x5390a2("group_" + _0x28c730 + "_" + aSlug(_0x2dfdf9));
    if (estado.current[_0x28c730] === _0x2dfdf9) {
      estado.current[_0x28c730] = null;
      _0x430fb2();
    }
    render();
  }
  async function _0x6153c8(_0x5e8f9b) {
    for (const _0x1ddf26 of estado.groups[_0x5e8f9b]) {
      const _0x1bfd64 = _0x5e8f9b + "::" + _0x1ddf26.name;
      if (!estado.groupData[_0x1bfd64]) {
        const _0x151664 = await _0x31ceb4("group_" + _0x5e8f9b + "_" + aSlug(_0x1ddf26.name));
        estado.groupData[_0x1bfd64] = _0x151664 ? Object.assign(grupoVacio(), _0x151664) : grupoVacio();
      }
    }
  }
  async function _0x5c71d9(_0x5d5727) {
    if (!estado.groups[_0x5d5727].length) {
      _0x279f78("Todavía no hay " + (_0x5d5727 === "montaje" ? "órdenes" : "proyectos") + " creados.");
      return;
    }
    await _0x6153c8(_0x5d5727);
    const _0x2ec2d7 = XLSX.utils.book_new();
    const _0x35741c = new Set();
    const _0x37c3fa = [];
    estado.groups[_0x5d5727].forEach(_0x4299e4 => {
      const _0x3dd9fe = _0x4299e4.name;
      const _0x4d72e4 = estado.groupData[_0x5d5727 + "::" + _0x3dd9fe] || grupoVacio();
      const _0x492161 = [..._0x4d72e4.pendiente.items.map(_0x40434e => ({
        OT: _0x3dd9fe,
        Fecha: fechaHoraTexto(),
        Artículo: _0x40434e.code + " — " + _0x40434e.desc,
        "Cantidad pedida": _0x40434e.qty,
        Pedido: _0x40434e.pedido ?? _0x40434e.qty,
        Reserva: _0x40434e.reserva ?? 0,
        Recibido: ""
      })), ..._0x4d72e4.servido.map(_0x591a3f => ({
        OT: _0x3dd9fe,
        Fecha: _0x591a3f.firstTs || _0x591a3f.ts,
        Artículo: _0x591a3f.code + " — " + _0x591a3f.desc,
        "Cantidad pedida": _0x591a3f.qty,
        Pedido: _0x591a3f.qty,
        Reserva: _0x591a3f.qty,
        Recibido: _0x591a3f.firstTs || _0x591a3f.ts
      }))];
      _0x37c3fa.push({
        [_0x216efa[_0x5d5727]]: _0x3dd9fe,
        "Unidades servidas": _0x4d72e4.servido.reduce((_0x4a6702, _0x5df7e4) => _0x4a6702 + _0x5df7e4.qty, 0),
        "Unidades devueltas": _0x4d72e4.devuelto.reduce((_0x3bc0a4, _0x51a6b7) => _0x3bc0a4 + _0x51a6b7.qty, 0)
      });
      let _0x4135bf = _0x3dd9fe.slice(0, 31).replace(/[\\/?*\[\]:]/g, " ");
      let _0x25b304 = _0x4135bf;
      let _0x3de454 = 2;
      while (_0x35741c.has(_0x4135bf)) {
        _0x4135bf = (_0x25b304.slice(0, 28) + "_" + _0x3de454).slice(0, 31);
        _0x3de454++;
      }
      _0x35741c.add(_0x4135bf);
      const _0x51ebac = _0x5dc8ea(_0x492161, {
        OT: _0x3dd9fe,
        Fecha: "",
        Artículo: "",
        "Cantidad pedida": "",
        Pedido: "",
        Reserva: "",
        Recibido: ""
      });
      XLSX.utils.book_append_sheet(_0x2ec2d7, _0x51ebac, _0x4135bf);
    });
    const _0x37be56 = _0x5dc8ea(_0x37c3fa);
    XLSX.utils.book_append_sheet(_0x2ec2d7, _0x37be56, "Resumen");
    _0x2ec2d7.SheetNames.unshift(_0x2ec2d7.SheetNames.pop());
    XLSX.writeFile(_0x2ec2d7, "historico_" + _0x5d5727 + "_" + Date.now() + ".xlsx");
  }
  async function _0x4c08ae() {
    await _0x6153c8("montaje");
    await _0x6153c8("proyecto");
    const _0x986aab = {
      version: 5,
      exportedAt: fechaHoraTexto(),
      catalog: estado.catalog,
      movements: estado.movements,
      groups: estado.groups,
      groupData: estado.groupData,
      bobinas: estado.bobinas,
      settings: estado.settings,
      pedidoItems: estado.pedidoItems,
      deliveries: estado.deliveries
    };
    const _0x3051e9 = new Blob([JSON.stringify(_0x986aab, null, 2)], {
      type: "application/json"
    });
    const _0x437208 = URL.createObjectURL(_0x3051e9);
    const _0x16d924 = document.createElement("a");
    _0x16d924.href = _0x437208;
    _0x16d924.download = "copia_seguridad_materiales_" + Date.now() + ".json";
    document.body.appendChild(_0x16d924);
    _0x16d924.click();
    _0x16d924.remove();
    URL.revokeObjectURL(_0x437208);
    _0x279f78("Copia de seguridad descargada.");
  }
  function _0x58a48a(_0x35d690) {
    const _0x54892c = new FileReader();
    _0x54892c.onload = async function (_0x5d4fcc) {
      try {
        const _0x47ae07 = JSON.parse(_0x5d4fcc.target.result);
        if (!(await _0x2cc777("Esto reemplazará el stock, las órdenes de montaje y los proyectos actuales por los de la copia de seguridad. ¿Continuar?"))) {
          return;
        }
        estado.catalog = (_0x47ae07.catalog || []).map(_0x251310 => ({
          id: _0x251310.id || nuevoId(),
          code: _0x251310.code,
          desc: _0x251310.desc,
          qty: typeof _0x251310.qty === "number" ? _0x251310.qty : 0,
          location: _0x251310.location || "",
          specs: _0x251310.specs || "",
          marca: _0x251310.marca || "",
          referencia: _0x251310.referencia || "",
          categoria: _0x251310.categoria || "",
          coste: typeof _0x251310.coste === "number" ? _0x251310.coste : 0
        }));
        estado.movements = _0x47ae07.movements || [];
        if (_0x47ae07.groups) {
          estado.groups = _0x47ae07.groups;
          estado.groupData = _0x47ae07.groupData || {};
        } else {
          estado.groups = {
            montaje: _0x47ae07.lists && _0x47ae07.lists.montaje && (_0x47ae07.lists.montaje.servido.length || _0x47ae07.lists.montaje.devuelto.length) ? [{
              name: "General",
              status: "activo"
            }] : [],
            proyecto: (_0x47ae07.projects || []).map(_0x4a196e => typeof _0x4a196e === "string" ? {
              name: _0x4a196e,
              status: "activo"
            } : {
              name: _0x4a196e.name,
              status: _0x4a196e.status || "activo"
            })
          };
          estado.groupData = {};
          if (_0x47ae07.lists && _0x47ae07.lists.montaje) {
            estado.groupData["montaje::General"] = Object.assign(grupoVacio(), _0x47ae07.lists.montaje);
          }
          Object.keys(_0x47ae07.projectData || {}).forEach(_0x3a51d0 => {
            estado.groupData["proyecto::" + _0x3a51d0] = Object.assign(grupoVacio(), _0x47ae07.projectData[_0x3a51d0]);
          });
        }
        guardarCatalogo(true);
        _0x240f8a();
        guardarListaGrupos("montaje");
        guardarListaGrupos("proyecto");
        Object.keys(estado.groupData).forEach(_0x3dc1c6 => {
          const [_0x3ad553, _0x535dee] = _0x3dc1c6.split("::");
          guardarGrupo(_0x3ad553, _0x535dee);
        });
        if (_0x47ae07.bobinas) {
          estado.bobinas = _0x47ae07.bobinas;
          _0x217fa8();
        }
        if (_0x47ae07.settings) {
          estado.settings = Object.assign({}, estado.settings, _0x47ae07.settings);
          _0x37360d();
        }
        if (_0x47ae07.pedidoItems) {
          estado.pedidoItems = _0x47ae07.pedidoItems;
          _0x253c4d();
        }
        if (_0x47ae07.deliveries) {
          estado.deliveries = _0x47ae07.deliveries;
          _0x529094();
        }
        _0x279f78("Copia de seguridad restaurada correctamente.");
        render();
      } catch (_0x95d421) {
        _0x279f78("No se pudo leer la copia de seguridad: " + _0x95d421.message);
      }
    };
    _0x54892c.readAsText(_0x35d690);
  }
  function _0x54b127() {
    const _0x28205c = XLSX.utils.book_new();
    const _0x2ec350 = estado.catalog.slice().sort((_0x4e2593, _0x3db2ca) => _0x4e2593.code.localeCompare(_0x3db2ca.code)).map(_0x1d5946 => ({
      Código: _0x1d5946.code,
      Artículo: _0x1d5946.desc,
      Referencia: _0x1d5946.referencia || "",
      Categoría: _0x1d5946.categoria || "",
      Ubicación: _0x1d5946.location || "",
      "Stock actual": _0x1d5946.qty,
      "Coste unitario": _0x1d5946.coste || 0,
      "Valor total": +(_0x1d5946.qty * (_0x1d5946.coste || 0)).toFixed(2)
    }));
    const _0x21f8ea = estado.movements.map(_0x1713dd => ({
      Código: _0x1713dd.code,
      Artículo: _0x1713dd.desc,
      Cantidad: _0x1713dd.qty,
      Tipo: _0x11c4a1(_0x1713dd.type),
      Origen: _0x1713dd.origin,
      Fecha: _0x1713dd.ts,
      Usuario: _0x1713dd.usuario || ""
    }));
    const _0x3f308a = estado.bobinas.slice().sort((_0x562eeb, _0x503269) => _0x562eeb.expira.localeCompare(_0x503269.expira)).map(_0x4ff398 => ({
      Código: _0x4ff398.codigo || "",
      Referencia: _0x4ff398.desc,
      Matrícula: _0x4ff398.matricula,
      "Devolver antes de": _0x4ff398.expira
    }));
    const _0x33926c = _0x5dc8ea(_0x2ec350, {
      Código: "",
      Artículo: "",
      Referencia: "",
      Categoría: "",
      Ubicación: "",
      "Stock actual": "",
      "Coste unitario": "",
      "Valor total": ""
    });
    const _0x41d780 = _0x5dc8ea(_0x21f8ea, {
      Código: "",
      Referencia: "",
      Cantidad: "",
      Tipo: "",
      Origen: "",
      Fecha: ""
    });
    const _0x12fb08 = _0x5dc8ea(_0x3f308a, {
      Código: "",
      Referencia: "",
      Matrícula: "",
      "Devolver antes de": ""
    });
    XLSX.utils.book_append_sheet(_0x28205c, _0x33926c, "Stock actual");
    XLSX.utils.book_append_sheet(_0x28205c, _0x41d780, "Movimientos");
    XLSX.utils.book_append_sheet(_0x28205c, _0x12fb08, "Bobinas");
    XLSX.writeFile(_0x28205c, "stock_almacen_" + Date.now() + ".xlsx");
  }
  function _0x55e21e(_0x4d455c, _0x109394, _0x1a41c4) {
    const _0x42befa = XLSX.utils.book_new();
    const _0x4c4596 = [..._0x4d455c.pendiente.items.map(_0x136587 => ({
      OT: _0x1a41c4 || "",
      Fecha: _0x136587.fechaGuardado || fechaHoraTexto(),
      Artículo: _0x136587.textoLibre ? _0x136587.textoLibre + " (sin referencia)" : _0x136587.code + " — " + _0x136587.desc,
      Referencia: _0x136587.textoLibre ? "" : _0x136587.referencia || "",
      "Cantidad pedida": _0x136587.qty,
      Pedido: _0x136587.pedido ?? _0x136587.qty,
      Reserva: _0x136587.reserva ?? 0,
      Recibido: ""
    })), ..._0x4d455c.servido.map(_0x4bd809 => ({
      OT: _0x1a41c4 || "",
      Fecha: _0x4bd809.firstTs || _0x4bd809.ts,
      Artículo: _0x4bd809.code + " — " + _0x4bd809.desc,
      Referencia: _0x4bd809.referencia || "",
      "Cantidad pedida": _0x4bd809.qty,
      Pedido: _0x4bd809.qty,
      Reserva: _0x4bd809.qty,
      Recibido: _0x4bd809.firstTs || _0x4bd809.ts
    }))];
    const _0x4e6ac3 = _0x5dc8ea(_0x4c4596, {
      OT: _0x1a41c4 || "",
      Fecha: "",
      Artículo: "",
      Referencia: "",
      "Cantidad pedida": "",
      Pedido: "",
      Reserva: "",
      Recibido: ""
    });
    XLSX.utils.book_append_sheet(_0x42befa, _0x4e6ac3, "Pedido de materiales");
    const _0xf1d08d = _0x4d455c.servido.map(_0x444c3b => ({
      Código: _0x444c3b.code,
      Artículo: _0x444c3b.desc,
      Cantidad: _0x444c3b.qty,
      Entregado: _0x444c3b.firstTs || _0x444c3b.ts,
      Actualizado: _0x444c3b.ts
    }));
    const _0x5f0fc5 = _0x4d455c.devuelto.map(_0x198993 => ({
      Código: _0x198993.code,
      Artículo: _0x198993.desc,
      Cantidad: _0x198993.qty,
      Entregado: _0x198993.deliveredAt || "",
      Devuelto: _0x198993.ts
    }));
    const _0x26dbd3 = _0x5dc8ea(_0xf1d08d, {
      Código: "",
      Artículo: "",
      Cantidad: "",
      Entregado: "",
      Actualizado: ""
    });
    const _0x5c92bf = _0x5dc8ea(_0x5f0fc5, {
      Código: "",
      Artículo: "",
      Cantidad: "",
      Entregado: "",
      Devuelto: ""
    });
    XLSX.utils.book_append_sheet(_0x42befa, _0x26dbd3, "Servido");
    XLSX.utils.book_append_sheet(_0x42befa, _0x5c92bf, "Devuelto");
    XLSX.writeFile(_0x42befa, _0x109394);
  }
  function _0xe4fd24(_0x3d58ec) {
    const _0x2b9cf8 = new FileReader();
    _0x2b9cf8.onload = function (_0x5c435a) {
      try {
        const _0x2b7a85 = XLSX.read(_0x5c435a.target.result, {
          type: "array"
        });
        const _0x2db228 = _0x2b7a85.Sheets[_0x2b7a85.SheetNames[0]];
        const _0x1160b8 = XLSX.utils.sheet_to_json(_0x2db228, {
          defval: ""
        });
        let _0x2fa091 = 0;
        let _0xd5c917 = 0;
        _0x1160b8.forEach(_0x59e8be => {
          const _0x2d742a = Object.keys(_0x59e8be);
          const _0x3dacda = _0x2d742a.find(_0x9aaf10 => /^(c[oó]digo|code|codigo|sku)$/i.test(_0x9aaf10.trim()));
          const _0x55d70 = _0x2d742a.find(_0x212532 => /^(descripci[oó]n|desc|art[ií]culo|material|nombre)$/i.test(_0x212532.trim()));
          const _0x5f353d = _0x2d742a.find(_0x59ce35 => /^(referencia|ref)$/i.test(_0x59ce35.trim()));
          const _0x5ade87 = _0x2d742a.find(_0x48ed46 => /^(stock|cantidad|existencias)$/i.test(_0x48ed46.trim()));
          const _0x3ed89e = _0x2d742a.find(_0x57a622 => /^(ubicaci[oó]n|location|lugar|posici[oó]n)$/i.test(_0x57a622.trim()));
          const _0x536b6f = _0x2d742a.find(_0x408d38 => /^(coste|costo|precio|precio unitario|coste unitario)$/i.test(_0x408d38.trim()));
          const _0x2edd84 = _0x3dacda ? String(_0x59e8be[_0x3dacda]).trim() : String(_0x59e8be[_0x2d742a[0]]).trim();
          const _0x3d6e23 = _0x55d70 ? String(_0x59e8be[_0x55d70]).trim() : "";
          const _0x4034da = _0x5f353d ? String(_0x59e8be[_0x5f353d]).trim() : "";
          const _0x25ed23 = _0x5ade87 ? parseInt(_0x59e8be[_0x5ade87], 10) : NaN;
          const _0x5a28c7 = _0x3ed89e ? String(_0x59e8be[_0x3ed89e]).trim() : "";
          const _0x52a143 = _0x536b6f ? parseFloat(String(_0x59e8be[_0x536b6f]).replace(",", ".").replace(/[^0-9.\-]/g, "")) : NaN;
          if (!_0x2edd84) {
            return;
          }
          let _0x3d7b57 = estado.catalog.find(_0xe706a4 => _0xe706a4.code.toLowerCase() === _0x2edd84.toLowerCase());
          if (_0x3d7b57) {
            if (_0x3d6e23) {
              _0x3d7b57.desc = _0x3d6e23;
            }
            if (_0x5a28c7) {
              _0x3d7b57.location = _0x5a28c7;
            }
            if (_0x4034da) {
              _0x3d7b57.referencia = _0x4034da;
            }
            if (!isNaN(_0x52a143)) {
              _0x3d7b57.coste = _0x52a143;
            }
          } else {
            _0x3d7b57 = {
              id: nuevoId(),
              code: _0x2edd84,
              desc: _0x3d6e23 || _0x4034da || "(sin referencia)",
              qty: 0,
              location: _0x5a28c7,
              referencia: _0x4034da,
              specs: "",
              marca: "",
              coste: !isNaN(_0x52a143) ? _0x52a143 : 0
            };
            estado.catalog.push(_0x3d7b57);
            _0x2fa091++;
          }
          if (!isNaN(_0x25ed23) && _0x25ed23 > 0) {
            _0x1d4277(_0x3d7b57, _0x25ed23, "entrada", "Importación catálogo");
            _0xd5c917++;
          }
        });
        guardarCatalogo();
        _0x279f78("Catálogo actualizado: " + _0x1160b8.length + " filas procesadas, " + _0x2fa091 + " materiales nuevos" + (_0xd5c917 ? ", " + _0xd5c917 + " con entrada de stock" : "") + ".");
        render();
      } catch (_0x2d1e01) {
        _0x279f78("No se pudo leer el archivo: " + _0x2d1e01.message);
      }
    };
    _0x2b9cf8.readAsArrayBuffer(_0x3d58ec);
  }
  function _0x344d6a(_0x1be550) {
    const _0x1ca04f = new FileReader();
    _0x1ca04f.onload = async function (_0x19f16b) {
      try {
        const _0x325298 = XLSX.read(_0x19f16b.target.result, {
          type: "array"
        });
        const _0xb28732 = _0x325298.Sheets[_0x325298.SheetNames[0]];
        const _0x5c604a = XLSX.utils.sheet_to_json(_0xb28732, {
          defval: ""
        });
        const _0x5e6070 = _0x5c604a.map(_0x2fee17 => {
          const _0x304015 = Object.keys(_0x2fee17);
          const _0x38d36e = _0x304015.find(_0x10d630 => /^(c[oó]digo|code|codigo|sku)$/i.test(_0x10d630.trim()));
          const _0x3ae4a6 = _0x304015.find(_0x374150 => /^(descripci[oó]n|desc|art[ií]culo|material|nombre)$/i.test(_0x374150.trim()));
          const _0xb74445 = _0x304015.find(_0x55f6cd => /^(referencia|ref)$/i.test(_0x55f6cd.trim()));
          const _0x30b3da = _0x304015.find(_0x282ddb => /^(stock|cantidad|existencias)$/i.test(_0x282ddb.trim()));
          const _0x249f14 = _0x304015.find(_0x44e7f8 => /^(ubicaci[oó]n|location|lugar|posici[oó]n)$/i.test(_0x44e7f8.trim()));
          return {
            code: _0x38d36e ? String(_0x2fee17[_0x38d36e]).trim() : "",
            desc: _0x3ae4a6 ? String(_0x2fee17[_0x3ae4a6]).trim() : "",
            referencia: _0xb74445 ? String(_0x2fee17[_0xb74445]).trim() : "",
            qty: _0x30b3da ? parseInt(_0x2fee17[_0x30b3da], 10) : NaN,
            location: _0x249f14 ? String(_0x2fee17[_0x249f14]).trim() : ""
          };
        }).filter(_0x48b217 => _0x48b217.code);
        if (!_0x5e6070.length) {
          _0x279f78("No he encontrado ninguna fila con código en ese archivo.");
          return;
        }
        const _0x11876e = new Set(_0x5e6070.map(_0x55d20a => _0x55d20a.code.toLowerCase()));
        const _0x514e32 = estado.catalog.filter(_0x54b88c => !_0x11876e.has(_0x54b88c.code.toLowerCase()));
        const _0x18dfac = "¿Sobrescribir todo el stock con este archivo?\n\n- " + _0x5e6070.length + " referencias en el Excel (se crean o se actualizan)\n- " + _0x514e32.length + " referencias que tienes ahora MISMO y no están en el archivo — se ELIMINARÁN del stock\n\nEsta acción no se puede deshacer. ¿Seguro que quieres continuar?";
        if (!(await _0x2cc777(_0x18dfac))) {
          return;
        }
        let _0x17c439 = 0;
        let _0x15a8c9 = 0;
        _0x5e6070.forEach(_0x503a9f => {
          let _0x395c21 = estado.catalog.find(_0x1d13c7 => _0x1d13c7.code.toLowerCase() === _0x503a9f.code.toLowerCase());
          if (!_0x395c21) {
            _0x395c21 = {
              id: nuevoId(),
              code: _0x503a9f.code,
              desc: _0x503a9f.desc || _0x503a9f.referencia || "(sin referencia)",
              qty: 0,
              location: _0x503a9f.location,
              referencia: _0x503a9f.referencia,
              specs: "",
              marca: ""
            };
            estado.catalog.push(_0x395c21);
            _0x15a8c9++;
          } else {
            if (_0x503a9f.desc) {
              _0x395c21.desc = _0x503a9f.desc;
            }
            if (_0x503a9f.location) {
              _0x395c21.location = _0x503a9f.location;
            }
            if (_0x503a9f.referencia) {
              _0x395c21.referencia = _0x503a9f.referencia;
            }
            _0x17c439++;
          }
          const _0x36cecd = !isNaN(_0x503a9f.qty) ? Math.max(0, _0x503a9f.qty) : _0x395c21.qty;
          const _0x592540 = _0x36cecd - _0x395c21.qty;
          if (_0x592540 !== 0) {
            _0x1d4277(_0x395c21, Math.abs(_0x592540), _0x592540 > 0 ? "entrada" : "salida", "Sobrescritura de stock (Excel)");
          }
        });
        _0x514e32.forEach(_0x4e83da => {
          estado.movements.unshift({
            id: nuevoId(),
            code: _0x4e83da.code,
            desc: _0x4e83da.desc,
            qty: _0x4e83da.qty,
            type: "eliminado",
            origin: "Sobrescritura de stock (Excel) — ya no está en el archivo",
            ts: fechaHoraTexto(),
            tsMs: Date.now(),
            usuario: usuarioActual()
          });
        });
        _0x240f8a();
        estado.catalog = estado.catalog.filter(_0xadc62 => _0x11876e.has(_0xadc62.code.toLowerCase()));
        guardarCatalogo();
        _0x279f78("Stock sobrescrito: " + _0x15a8c9 + " nuevas, " + _0x17c439 + " actualizadas, " + _0x514e32.length + " eliminadas.");
        render();
      } catch (_0x575069) {
        _0x279f78("No se pudo leer el archivo: " + _0x575069.message);
      }
    };
    _0x1ca04f.readAsArrayBuffer(_0x1be550);
  }
  function _0x4de45d(_0x394348) {
    return new Promise((_0x41f4be, _0x513e59) => {
      const _0x20d88e = new FileReader();
      _0x20d88e.onload = _0x3330b0 => {
        try {
          const _0x28495d = XLSX.read(_0x3330b0.target.result, {
            type: "array"
          });
          const _0x3bca37 = _0x28495d.Sheets[_0x28495d.SheetNames[0]];
          const _0x2e321e = XLSX.utils.sheet_to_json(_0x3bca37, {
            defval: ""
          });
          const _0x24d9ad = _0x2e321e.map(_0x49e5d5 => {
            const _0x3f6123 = Object.keys(_0x49e5d5);
            const _0x3d8149 = _0x3f6123.find(_0x381d10 => /^(c[oó]digo|code|codigo|sku)$/i.test(_0x381d10.trim()));
            const _0x9eefe4 = _0x3f6123.find(_0x24fb31 => /^(descripci[oó]n|desc|art[ií]culo|material|nombre)$/i.test(_0x24fb31.trim()));
            const _0x555996 = _0x3f6123.find(_0x13463b => /^(referencia|ref)$/i.test(_0x13463b.trim()));
            const _0xd99081 = _0x3f6123.find(_0x2c8c07 => /^(cantidad|unidades|uds|qty|pedido)$/i.test(_0x2c8c07.trim()));
            const _0x4e347e = _0x3d8149 ? String(_0x49e5d5[_0x3d8149]).trim() : _0x555996 ? String(_0x49e5d5[_0x555996]).trim() : "";
            const _0x577819 = _0x9eefe4 ? String(_0x49e5d5[_0x9eefe4]).trim() : !_0x3d8149 && !_0x555996 ? String(_0x49e5d5[_0x3f6123[0]]).trim() : "";
            const _0x28de72 = _0xd99081 ? Math.max(1, parseInt(_0x49e5d5[_0xd99081], 10) || 1) : 1;
            return {
              code: _0x4e347e,
              desc: _0x577819,
              qty: _0x28de72
            };
          }).filter(_0x3b95be => _0x3b95be.code || _0x3b95be.desc);
          _0x41f4be(_0x24d9ad);
        } catch (_0x5ab19d) {
          _0x513e59(_0x5ab19d);
        }
      };
      _0x20d88e.onerror = () => _0x513e59(new Error("No se pudo leer el archivo"));
      _0x20d88e.readAsArrayBuffer(_0x394348);
    });
  }
  async function _0x40e5f4(_0x11f149) {
    if (typeof pdfjsLib === "undefined") {
      _0x279f78("No se pudo cargar el lector de PDF. Prueba subiendo un Excel/CSV en su lugar.");
      return [];
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const _0x48f8da = await _0x11f149.arrayBuffer();
    const _0x3d441d = await pdfjsLib.getDocument({
      data: _0x48f8da
    }).promise;
    let _0x466d79 = "";
    for (let _0x39ee9a = 1; _0x39ee9a <= _0x3d441d.numPages; _0x39ee9a++) {
      const _0x49676a = await _0x3d441d.getPage(_0x39ee9a);
      const _0x180571 = await _0x49676a.getTextContent();
      _0x466d79 += _0x180571.items.map(_0x2cc5db => _0x2cc5db.str).join(" ") + "\n";
    }
    return _0x4b6c29(_0x466d79);
  }
  function _0x4b6c29(_0x303e8a) {
    const _0x37996d = [];
    _0x303e8a.split("\n").map(_0x252a7a => _0x252a7a.trim()).filter(Boolean).forEach(_0x28b0a5 => {
      const _0x82a777 = _0x28b0a5.match(/^(.*?)\s+(\d+)\s*(?:uds?\.?|unidades)?$/i);
      if (_0x82a777 && _0x82a777[1].trim().length > 1) {
        _0x37996d.push({
          code: "",
          desc: _0x82a777[1].trim(),
          qty: Math.max(1, parseInt(_0x82a777[2], 10) || 1)
        });
      }
    });
    return _0x37996d;
  }
  let _0x453578 = null;
  async function _0x2f0af0(_0x35872) {
    const _0x3cd8e1 = _0x1ea037();
    if (!_0x3cd8e1) {
      _0x279f78("Selecciona " + (estado.mode === "montaje" ? "una orden de montaje" : "un proyecto") + " antes de subir el archivo.");
      return;
    }
    const _0x359113 = (_0x35872.name.split(".").pop() || "").toLowerCase();
    let _0x5dd670 = [];
    try {
      if (["xlsx", "xls", "csv"].includes(_0x359113)) {
        _0x5dd670 = await _0x4de45d(_0x35872);
      } else if (_0x359113 === "pdf") {
        _0x5dd670 = await _0x40e5f4(_0x35872);
      } else {
        _0x279f78("Formato no soportado — usa Excel, CSV o PDF.");
        return;
      }
    } catch (_0x1d488b) {
      _0x279f78("No se pudo leer el archivo: " + _0x1d488b.message);
      return;
    }
    if (!_0x5dd670.length) {
      _0x279f78("No he podido sacar ninguna línea de ese archivo.");
      return;
    }
    const _0x343de3 = _0x5dd670.map(_0x46d819 => {
      let _0x7e8f09 = _0x46d819.code ? buscarPorCodigo(_0x46d819.code) : null;
      if (!_0x7e8f09 && _0x46d819.code) {
        _0x7e8f09 = estado.catalog.find(_0x290762 => _0x290762.referencia && _0x290762.referencia.toLowerCase() === _0x46d819.code.toLowerCase());
      }
      if (!_0x7e8f09 && _0x46d819.desc) {
        _0x7e8f09 = estado.catalog.find(_0x2d94cb => _0x2d94cb.desc.toLowerCase() === _0x46d819.desc.toLowerCase());
      }
      if (_0x7e8f09) {
        const _0x1c2f53 = Math.min(_0x46d819.qty, _0x7e8f09.qty);
        return {
          kind: _0x1c2f53 <= 0 ? "sin-stock" : _0x1c2f53 < _0x46d819.qty ? "parcial" : "ok",
          itemId: _0x7e8f09.id,
          code: _0x7e8f09.code,
          desc: _0x7e8f09.desc,
          requested: _0x46d819.qty,
          toServe: _0x1c2f53
        };
      }
      return {
        kind: "nueva",
        code: _0x46d819.code,
        desc: _0x46d819.desc,
        requested: _0x46d819.qty
      };
    });
    _0x453578 = {
      plan: _0x343de3,
      targetKey: estado.mode + "::" + estado.current[estado.mode]
    };
    render();
  }
  function _0x1305ba() {
    if (!_0x453578) {
      return;
    }
    const _0x3cf49d = _0x1ea037();
    if (!_0x3cf49d) {
      _0x453578 = null;
      render();
      return;
    }
    if (!_0x3cf49d.pendiente.requesterName) {
      _0x279f78("Indica quién hace la solicitud (campo \"¿Quién lo pide?\") antes de aplicar el archivo.");
      return;
    }
    let _0x374203 = 0;
    let _0x36f954 = 0;
    _0x453578.plan.forEach(_0x539568 => {
      if (_0x539568.kind === "nueva") {
        const _0xce7fb6 = _0x539568.code || "REF-" + aSlug(_0x539568.desc || nuevoId());
        const _0x49a819 = _0x12054f(_0xce7fb6, _0x539568.desc || "(sin referencia)", "");
        _0xc5b186(_0x3cf49d, _0x49a819, _0x539568.requested);
        _0x36f954++;
      } else {
        const _0x5d3e5e = estado.catalog.find(_0xa7fd7d => _0xa7fd7d.id === _0x539568.itemId);
        if (!_0x5d3e5e) {
          return;
        }
        _0xc5b186(_0x3cf49d, _0x5d3e5e, _0x539568.requested);
        _0x374203++;
      }
    });
    _0x29f0a4();
    _0x453578 = null;
    render();
    _0x279f78("Archivo añadido a la solicitud pendiente: " + _0x374203 + " línea(s)" + (_0x36f954 ? ", " + _0x36f954 + " creadas como plantilla nueva" : "") + ". Prepara la recogida y firma cuando corresponda.");
  }
  function _0x58f658() {
    _0x453578 = null;
    render();
  }
  let _0x2bda1b = false;
  let _0x429406 = false;
  let _0x2f0c4f = null;
  function _0x3f1ebf() {
    const _0x5504f6 = $("#signatureOverlay");
    if (!_0x5504f6) {
      return;
    }
    if (!estado.pendingDelivery) {
      _0x5504f6.style.display = "none";
      return;
    }
    _0x5504f6.style.display = "flex";
    const _0xd610ea = $("#signatureItemsList");
    _0xd610ea.innerHTML = "<div class=\"sig-item\" style=\"color:var(--accent); font-weight:700;\">Pedido por: " + _0x1d1ab0(estado.pendingDelivery.requesterName || "sin especificar") + "</div>" + estado.pendingDelivery.items.map(_0x5f1565 => "<div class=\"sig-item\">" + _0x1d1ab0(_0x5f1565.code) + " · " + _0x1d1ab0(_0x5f1565.desc) + " · <strong>" + _0x5f1565.qty + " uds</strong></div>").join("");
    const _0x30e794 = $("#recipientNameInput");
    if (_0x30e794 && !_0x30e794.value) {
      _0x30e794.value = estado.pendingDelivery.recipientName || "";
    }
    _0x4e4636();
    const _0x403ce9 = $("#clearSignatureBtn");
    if (_0x403ce9) {
      _0x403ce9.onclick = _0x5dffee;
    }
    const _0x5ac4be = $("#cancelDeliveryBtn");
    if (_0x5ac4be) {
      _0x5ac4be.onclick = _0x59f3bd;
    }
    const _0x279265 = $("#confirmDeliveryBtn");
    if (_0x279265) {
      _0x279265.onclick = () => {
        if (!_0x429406) {
          _0x279f78("Falta la firma — hay que firmar antes de confirmar la entrega.");
          return;
        }
        if (_0x279265.disabled) {
          return;
        }
        _0x279265.disabled = true;
        estado.pendingDelivery.recipientName = (_0x30e794.value || "").trim();
        const _0xe4ac1 = $("#signatureCanvas");
        _0x28a554(_0xe4ac1.toDataURL("image/png"));
      };
    }
  }
  function _0x4e4636() {
    const _0x1b611d = $("#signatureCanvas");
    if (!_0x1b611d || _0x1b611d.dataset.ready) {
      return;
    }
    _0x1b611d.dataset.ready = "1";
    const _0x217154 = window.devicePixelRatio || 1;
    const _0x2bfc94 = _0x1b611d.getBoundingClientRect();
    _0x1b611d.width = _0x2bfc94.width * _0x217154;
    _0x1b611d.height = _0x2bfc94.height * _0x217154;
    _0x2f0c4f = _0x1b611d.getContext("2d");
    _0x2f0c4f.scale(_0x217154, _0x217154);
    _0x2f0c4f.lineWidth = 2.2;
    _0x2f0c4f.lineCap = "round";
    _0x2f0c4f.lineJoin = "round";
    _0x2f0c4f.strokeStyle = "#14161C";
    _0x429406 = false;
    const _0x213035 = _0x589a7e => {
      const _0x52e1ba = _0x1b611d.getBoundingClientRect();
      return {
        x: _0x589a7e.clientX - _0x52e1ba.left,
        y: _0x589a7e.clientY - _0x52e1ba.top
      };
    };
    _0x1b611d.onpointerdown = _0x31d3ea => {
      _0x2bda1b = true;
      _0x429406 = true;
      const _0x21015c = _0x213035(_0x31d3ea);
      _0x2f0c4f.beginPath();
      _0x2f0c4f.moveTo(_0x21015c.x, _0x21015c.y);
      _0x1b611d.setPointerCapture(_0x31d3ea.pointerId);
    };
    _0x1b611d.onpointermove = _0x469b8c => {
      if (!_0x2bda1b) {
        return;
      }
      const _0x56485b = _0x213035(_0x469b8c);
      _0x2f0c4f.lineTo(_0x56485b.x, _0x56485b.y);
      _0x2f0c4f.stroke();
    };
    const _0x134554 = () => {
      _0x2bda1b = false;
    };
    _0x1b611d.onpointerup = _0x134554;
    _0x1b611d.onpointerleave = _0x134554;
    _0x1b611d.onpointercancel = _0x134554;
  }
  function _0x5dffee() {
    const _0x1d43e3 = $("#signatureCanvas");
    if (!_0x1d43e3 || !_0x2f0c4f) {
      return;
    }
    const _0x5552e6 = window.devicePixelRatio || 1;
    _0x2f0c4f.clearRect(0, 0, _0x1d43e3.width / _0x5552e6, _0x1d43e3.height / _0x5552e6);
    _0x429406 = false;
  }
  function _0x1abbb2() {
    const _0x448395 = $("#signatureCanvas");
    if (_0x448395) {
      delete _0x448395.dataset.ready;
    }
    _0x2f0c4f = null;
    _0x429406 = false;
  }
  let _0x4e20d6 = null;
  function _0x210142(_0x588acc) {
    return new Promise(_0x3976d0 => {
      const _0x2633d2 = $("#askCodeOverlay");
      const _0x4cb7fe = $("#askCodeInput");
      $("#askCodeTitulo").textContent = _0x588acc;
      _0x4cb7fe.value = "";
      _0x2633d2.style.display = "flex";
      _0x4cb7fe.focus({
        preventScroll: true
      });
      const _0x47b3c8 = _0xe2a927 => {
        _0x2633d2.style.display = "none";
        _0x51bb31.removeEventListener("click", _0x413b97);
        _0x351ed0.removeEventListener("click", _0x25f10b);
        _0x375695.removeEventListener("click", _0xd6b7a2);
        _0x4cb7fe.removeEventListener("keydown", _0x471f83);
        _0x3976d0(_0xe2a927);
      };
      const _0x51bb31 = $("#askCodeOkBtn");
      const _0x351ed0 = $("#askCodeCancelBtn");
      const _0x375695 = $("#askCodeCamBtn");
      const _0x413b97 = () => _0x47b3c8(_0x4cb7fe.value.trim() || null);
      const _0x25f10b = () => _0x47b3c8(null);
      const _0xd6b7a2 = () => {
        _0x2633d2.style.display = "none";
        _0xe99bca(_0x2a6cee => {
          _0x47b3c8(_0x2a6cee);
        });
      };
      const _0x471f83 = _0x45071f => {
        if (_0x45071f.key === "Enter") {
          _0x45071f.preventDefault();
          _0x413b97();
        }
      };
      _0x51bb31.addEventListener("click", _0x413b97);
      _0x351ed0.addEventListener("click", _0x25f10b);
      _0x375695.addEventListener("click", _0xd6b7a2);
      _0x4cb7fe.addEventListener("keydown", _0x471f83);
    });
  }
  async function _0xe99bca(_0x4738d7) {
    if (!("BarcodeDetector" in window)) {
      _0x279f78("Tu navegador no soporta escaneo por cámara. Usa un lector USB/Bluetooth o introduce el código manualmente.");
      return;
    }
    const _0x2982a4 = $("#camOverlay");
    const _0x3b517a = $("#camVideo");
    _0x2982a4.style.display = "flex";
    try {
      _0x4e20d6 = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        }
      });
      _0x3b517a.srcObject = _0x4e20d6;
      const _0x3bd255 = new BarcodeDetector();
      const _0x21324b = async () => {
        if (!_0x4e20d6) {
          return;
        }
        try {
          const _0xf742bd = await _0x3bd255.detect(_0x3b517a);
          if (_0xf742bd && _0xf742bd.length) {
            _0x46d5dc();
            _0x4738d7(_0xf742bd[0].rawValue);
            return;
          }
        } catch (_0x584daa) {}
        if (_0x4e20d6) {
          requestAnimationFrame(_0x21324b);
        }
      };
      requestAnimationFrame(_0x21324b);
    } catch (_0x972ddb) {
      $("#camStatus").textContent = "No se pudo acceder a la cámara: " + _0x972ddb.message;
    }
  }
  function _0x46d5dc() {
    if (_0x4e20d6) {
      _0x4e20d6.getTracks().forEach(_0x546984 => _0x546984.stop());
      _0x4e20d6 = null;
    }
    $("#camOverlay").style.display = "none";
  }
  $("#camClose").addEventListener("click", _0x46d5dc);
  let _0x309b07 = null;
  let _0xb33f4f = [];
  async function _0x1c65e1() {
    if (!_0x1ea037()) {
      _0x279f78("Selecciona primero una orden o proyecto.");
      return;
    }
    const _0x3cda4b = $("#docScanOverlay");
    const _0x3db95c = $("#docScanVideo");
    _0xb33f4f = [];
    _0x3b930e();
    _0x3cda4b.style.display = "flex";
    try {
      _0x309b07 = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: {
            ideal: 2560
          },
          height: {
            ideal: 1440
          }
        }
      });
      _0x3db95c.srcObject = _0x309b07;
    } catch (_0x3065f2) {
      $("#docScanStatus").textContent = "No se pudo acceder a la cámara: " + _0x3065f2.message;
    }
  }
  function _0x512cbd() {
    if (typeof __geminiAbortCtrl !== "undefined" && __geminiAbortCtrl) {
      __geminiAbortCtrl.abort();
      __geminiAbortCtrl = null;
    }
    if (_0x309b07) {
      _0x309b07.getTracks().forEach(_0x34ace6 => _0x34ace6.stop());
      _0x309b07 = null;
    }
    $("#docScanOverlay").style.display = "none";
    _0xb33f4f = [];
    const __elInstrClose = $("#docScanInstrucciones");
    if (__elInstrClose) {
      __elInstrClose.value = "";
    }
  }
  function autoRecortarDocumento(lienzo) {
    try {
      const anchoOriginal = lienzo.width;
      const altoOriginal = lienzo.height;
      if (anchoOriginal < 60 || altoOriginal < 60) {
        return lienzo;
      }
      const ctxOriginal = lienzo.getContext("2d");
      const datos = ctxOriginal.getImageData(0, 0, anchoOriginal, altoOriginal).data;
      const luminancia = (x, y) => {
        const i = (y * anchoOriginal + x) * 4;
        return datos[i] * 0.299 + datos[i + 1] * 0.587 + datos[i + 2] * 0.114;
      };
      const paso = 4;
      const franjaRef = Math.max(3, Math.round(Math.min(anchoOriginal, altoOriginal) * 0.015));
      let sumaFondo = 0;
      let cuentaFondo = 0;
      for (let x = 0; x < anchoOriginal; x += paso) {
        for (let d = 0; d < franjaRef; d++) {
          sumaFondo += luminancia(x, d);
          cuentaFondo++;
          sumaFondo += luminancia(x, altoOriginal - 1 - d);
          cuentaFondo++;
        }
      }
      for (let y = 0; y < altoOriginal; y += paso) {
        for (let d = 0; d < franjaRef; d++) {
          sumaFondo += luminancia(d, y);
          cuentaFondo++;
          sumaFondo += luminancia(anchoOriginal - 1 - d, y);
          cuentaFondo++;
        }
      }
      const fondoMedio = sumaFondo / Math.max(1, cuentaFondo);
      const umbral = 28;
      const filaCentral = Math.round(altoOriginal / 2);
      const colCentral = Math.round(anchoOriginal / 2);
      let izquierda = 0;
      for (let x = 0; x < anchoOriginal / 2; x += paso) {
        if (Math.abs(luminancia(x, filaCentral) - fondoMedio) > umbral) {
          izquierda = x;
          break;
        }
      }
      let derecha = anchoOriginal - 1;
      for (let x = anchoOriginal - 1; x > anchoOriginal / 2; x -= paso) {
        if (Math.abs(luminancia(x, filaCentral) - fondoMedio) > umbral) {
          derecha = x;
          break;
        }
      }
      let arriba = 0;
      for (let y = 0; y < altoOriginal / 2; y += paso) {
        if (Math.abs(luminancia(colCentral, y) - fondoMedio) > umbral) {
          arriba = y;
          break;
        }
      }
      let abajo = altoOriginal - 1;
      for (let y = altoOriginal - 1; y > altoOriginal / 2; y -= paso) {
        if (Math.abs(luminancia(colCentral, y) - fondoMedio) > umbral) {
          abajo = y;
          break;
        }
      }
      const margen = Math.round(Math.min(anchoOriginal, altoOriginal) * 0.015);
      izquierda = Math.max(0, izquierda - margen);
      arriba = Math.max(0, arriba - margen);
      derecha = Math.min(anchoOriginal - 1, derecha + margen);
      abajo = Math.min(altoOriginal - 1, abajo + margen);
      const anchoRecorte = derecha - izquierda;
      const altoRecorte = abajo - arriba;
      if (anchoRecorte < anchoOriginal * 0.5 || altoRecorte < altoOriginal * 0.5) {
        return lienzo;
      }
      if (anchoRecorte > anchoOriginal * 0.97 && altoRecorte > altoOriginal * 0.97) {
        return lienzo;
      }
      const lienzoRecortado = document.createElement("canvas");
      lienzoRecortado.width = anchoRecorte;
      lienzoRecortado.height = altoRecorte;
      lienzoRecortado.getContext("2d").drawImage(lienzo, izquierda, arriba, anchoRecorte, altoRecorte, 0, 0, anchoRecorte, altoRecorte);
      return lienzoRecortado;
    } catch (e) {
      return lienzo;
    }
  }
  function _0x4e1af1() {
    const _0x465c26 = $("#docScanVideo");
    if (!_0x465c26.videoWidth) {
      return;
    }
    const _0x389971 = document.createElement("canvas");
    const _origAncho = _0x465c26.videoWidth;
    const _origAlto = _0x465c26.videoHeight;
    const _dimMax = 2200;
    const _escala = Math.min(1, _dimMax / Math.max(_origAncho, _origAlto));
    _0x389971.width = Math.round(_origAncho * _escala);
    _0x389971.height = Math.round(_origAlto * _escala);
    _0x389971.getContext("2d").drawImage(_0x465c26, 0, 0, _0x389971.width, _0x389971.height);
    const _lienzoFinal = autoRecortarDocumento(_0x389971);
    const _urlCompleta = _lienzoFinal.toDataURL("image/jpeg", 0.9);
    const _anchoMini = 220;
    const _escalaMini = Math.min(1, _anchoMini / _lienzoFinal.width);
    const _lienzoMini = document.createElement("canvas");
    _lienzoMini.width = Math.max(1, Math.round(_lienzoFinal.width * _escalaMini));
    _lienzoMini.height = Math.max(1, Math.round(_lienzoFinal.height * _escalaMini));
    _lienzoMini.getContext("2d").drawImage(_lienzoFinal, 0, 0, _lienzoMini.width, _lienzoMini.height);
    _0xb33f4f.push({
      url: _urlCompleta,
      thumb: _lienzoMini.toDataURL("image/jpeg", 0.6),
      w: _lienzoFinal.width,
      h: _lienzoFinal.height
    });
    _0x3b930e();
  }
  function _0x3b930e() {
    $("#docScanThumbs").innerHTML = _0xb33f4f.map((_0x3ce1f4, _0x593fa9) => "<img src=\"" + _0x3ce1f4.thumb + "\" data-quitar-pagina=\"" + _0x593fa9 + "\" title=\"Pulsa para quitar esta página\">").join("");
    $("#docScanTerminarBtn").disabled = _0xb33f4f.length === 0;
    $("#docScanStatus").textContent = _0xb33f4f.length ? _0xb33f4f.length + " página(s) capturada(s) — toca una foto para quitarla" : "Encuadra la página y pulsa \"Capturar página\"";
    $("#docScanThumbs").querySelectorAll("[data-quitar-pagina]").forEach(_0xe74ca1 => {
      _0xe74ca1.addEventListener("click", () => {
        _0xb33f4f.splice(parseInt(_0xe74ca1.dataset.quitarPagina, 10), 1);
        _0x3b930e();
      });
    });
  }
  let _0x1a8185 = null;
  async function __subirPdfComoPaginas(__file) {
    const __statusEl = $("#docScanStatus");
    try {
      if (__statusEl) {
        __statusEl.textContent = "Leyendo PDF…";
      }
      if (typeof pdfjsLib === "undefined") {
        throw new Error("El lector de PDF no está disponible");
      }
      pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      const __buffer = await __file.arrayBuffer();
      const __pdf = await pdfjsLib.getDocument({
        data: __buffer
      }).promise;
      for (let __n = 1; __n <= __pdf.numPages; __n++) {
        if (__statusEl) {
          __statusEl.textContent = "Convirtiendo página " + __n + " de " + __pdf.numPages + "…";
        }
        const __pagina = await __pdf.getPage(__n);
        const __viewport = __pagina.getViewport({
          scale: 2
        });
        const __lienzo = document.createElement("canvas");
        __lienzo.width = Math.round(__viewport.width);
        __lienzo.height = Math.round(__viewport.height);
        await __pagina.render({
          canvasContext: __lienzo.getContext("2d"),
          viewport: __viewport
        }).promise;
        const __urlCompleta = __lienzo.toDataURL("image/jpeg", 0.9);
        const __anchoMini = 220;
        const __escalaMini = Math.min(1, __anchoMini / __lienzo.width);
        const __lienzoMini = document.createElement("canvas");
        __lienzoMini.width = Math.max(1, Math.round(__lienzo.width * __escalaMini));
        __lienzoMini.height = Math.max(1, Math.round(__lienzo.height * __escalaMini));
        __lienzoMini.getContext("2d").drawImage(__lienzo, 0, 0, __lienzoMini.width, __lienzoMini.height);
        _0xb33f4f.push({
          url: __urlCompleta,
          thumb: __lienzoMini.toDataURL("image/jpeg", 0.6),
          w: __lienzo.width,
          h: __lienzo.height
        });
      }
      _0x3b930e();
      if (__statusEl) {
        __statusEl.textContent = _0xb33f4f.length + " página(s) capturada(s) — toca una foto para quitarla";
      }
    } catch (__err) {
      if (__statusEl) {
        __statusEl.textContent = "No se pudo leer el PDF: " + (__err && __err.message || "error");
      }
    }
  }
  const __TIPOS_MATERIAL = [["interno", "Interno"], ["externo", "Externo"], ["pequeno", "Pequeño material"]];
  const __IA_MAX_DIA = 8;
  const __IA_MAX_LINEAS = 20;
  const __IA_MAX_CANDIDATOS = 6;
  const __IA_MAX_CACHE = 400;
  const __IA_MIN_AUTO = 3;
  const __REF_AUTO_SIM = 0.8;
  const __CLASIF_VACIAS = new Set(["del", "los", "las", "con", "para", "por", "una", "unos", "unas", "uds", "mts"]);
  function __clasifNormalizar(_0x8fc065) {
    return (_0x8fc065 || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  }
  function __clasifRaiz(_0x3d12f0) {
    if (_0x3d12f0.length > 4 && /(ones|ores|ales|eles|iles|ares)$/.test(_0x3d12f0)) {
      return _0x3d12f0.slice(0, -2);
    }
    if (_0x3d12f0.length > 3 && /[aeiou]s$/.test(_0x3d12f0)) {
      return _0x3d12f0.slice(0, -1);
    }
    return _0x3d12f0;
  }
  function __clasifPalabras(_0x5ed406) {
    return __clasifNormalizar(_0x5ed406).split(" ").filter(_0x59d888 => _0x59d888.length >= 3 && !__CLASIF_VACIAS.has(_0x59d888) && !/\d/.test(_0x59d888)).map(__clasifRaiz);
  }
  function __clasifNumeros(_0x2cee3d) {
    return __clasifNormalizar(_0x2cee3d).split(" ").filter(_0x291e79 => /^\d+$/.test(_0x291e79));
  }
  function __clasifNumerosCompatibles(_0x3ece82, _0x297e27) {
    const _0x3889b5 = __clasifNumeros(_0x297e27);
    return __clasifNumeros(_0x3ece82).every(_0x43682c => _0x3889b5.indexOf(_0x43682c) >= 0);
  }
  function __clasifFichas(_0x30feb7) {
    const _0x2fdc12 = [];
    __clasifNormalizar(_0x30feb7).split(" ").forEach(_0x4426c6 => {
      if (_0x4426c6.length < 2 || __CLASIF_VACIAS.has(_0x4426c6)) {
        return;
      }
      const _0x1fd642 = __clasifRaiz(_0x4426c6);
      if (_0x2fdc12.indexOf(_0x1fd642) < 0) {
        _0x2fdc12.push(_0x1fd642);
      }
    });
    return _0x2fdc12.sort();
  }
  function __clasifStore() {
    const _0x5ae0ce = estado.clasificacion = estado.clasificacion || {};
    _0x5ae0ce.ref = _0x5ae0ce.ref || {};
    _0x5ae0ce.pal = _0x5ae0ce.pal || {};
    _0x5ae0ce.email = _0x5ae0ce.email || "";
    _0x5ae0ce.asoc = _0x5ae0ce.asoc || {};
    _0x5ae0ce.peticiones = _0x5ae0ce.peticiones || [];
    _0x5ae0ce.pq = _0x5ae0ce.pq || [];
    _0x5ae0ce.ia = _0x5ae0ce.ia || {};
    _0x5ae0ce.ia.cache = _0x5ae0ce.ia.cache || {};
    _0x5ae0ce.ia.dia = _0x5ae0ce.ia.dia || {
      f: "",
      n: 0
    };
    _0x5ae0ce.ia.uso = _0x5ae0ce.ia.uso || {
      f: "",
      texto: 0,
      resumen: 0
    };
    _0x5ae0ce.ia.txt = _0x5ae0ce.ia.txt || {};
    if (typeof _0x5ae0ce.ia.auto !== "boolean") {
      _0x5ae0ce.ia.auto = true;
    }
    __clasifMigrar(_0x5ae0ce);
    return _0x5ae0ce;
  }
  function __clasifMigrar(_0x3ec838) {
    let _0x262eb0 = false;
    if (!(_0x3ec838.v >= 2)) {
      const _0x4328f5 = {};
      for (const _0x1b2f47 in _0x3ec838.pal || {}) {
        const _0x2d378e = __clasifRaiz(_0x1b2f47);
        const _0x2d66d1 = _0x4328f5[_0x2d378e] = _0x4328f5[_0x2d378e] || {
          interno: 0,
          externo: 0,
          pequeno: 0
        };
        for (const _0x4908bb of ["interno", "externo", "pequeno"]) {
          _0x2d66d1[_0x4908bb] += _0x3ec838.pal[_0x1b2f47][_0x4908bb] || 0;
        }
      }
      _0x3ec838.pal = _0x4328f5;
      _0x3ec838.v = 2;
      _0x262eb0 = true;
    }
    const _0x780dd5 = estado.catalog || [];
    if (!(_0x3ec838.v >= 3) && (_0x780dd5.length || !Object.keys(_0x3ec838.ref || {}).length)) {
      _0x3ec838.pq = _0x3ec838.pq || [];
      for (const _0x16d2dd in _0x3ec838.ref || {}) {
        const _0x844af3 = _0x3ec838.ref[_0x16d2dd];
        const _0x5b80fb = (_0x844af3.interno || 0) + (_0x844af3.externo || 0) + (_0x844af3.pequeno || 0);
        if (!(_0x844af3.pequeno >= 1) || !(_0x844af3.pequeno / _0x5b80fb >= 0.6)) {
          continue;
        }
        const _0x40552c = _0x780dd5.find(_0x1ef5e0 => String(_0x1ef5e0.code).toLowerCase() === _0x16d2dd);
        if (_0x40552c && !_0x3ec838.pq.some(_0x3d55a2 => _0x3d55a2.key === "c:" + _0x16d2dd)) {
          _0x3ec838.pq.push({
            id: nuevoId(),
            key: "c:" + _0x16d2dd,
            code: _0x40552c.code,
            desc: _0x40552c.desc || _0x40552c.code,
            ts: Date.now()
          });
        }
      }
      _0x3ec838.v = 3;
      _0x262eb0 = true;
    }
    return _0x262eb0;
  }
  function __clasifClavePQ(_0x1f0572, _0x4bf74e) {
    if (_0x1f0572) {
      return "c:" + String(_0x1f0572).toLowerCase();
    } else {
      return "t:" + __clasifFichas(_0x4bf74e).join(" ");
    }
  }
  function __clasifRegistrarPQ(_0x15f53e) {
    const _0x38ffd1 = __clasifStore();
    const _0x286200 = _0x15f53e.textoOrig || _0x15f53e.textoLibre || "";
    const _0x686d32 = __clasifClavePQ(_0x15f53e.code, _0x15f53e.code ? "" : _0x15f53e.textoLibre || _0x15f53e.textoOrig || _0x15f53e.desc);
    if (_0x686d32 === "t:") {
      return;
    }
    if (_0x15f53e.code && _0x286200) {
      const _0x51d92d = __clasifClavePQ("", _0x286200);
      _0x38ffd1.pq = _0x38ffd1.pq.filter(_0x312b02 => _0x312b02.key !== _0x51d92d);
    }
    if (_0x38ffd1.pq.some(_0x565c69 => _0x565c69.key === _0x686d32)) {
      return;
    }
    _0x38ffd1.pq.push({
      id: nuevoId(),
      key: _0x686d32,
      code: _0x15f53e.code || "",
      desc: (_0x15f53e.code ? _0x15f53e.desc : _0x15f53e.textoLibre || _0x15f53e.textoOrig || _0x15f53e.desc) || _0x15f53e.code,
      ts: Date.now()
    });
  }
  function __guardarClasif() {
    guardar("clasificacion", estado.clasificacion);
  }
  function __clasifVoto(_0x141d4f, _0x44c43b, _0x362cc0, _0x4bb337) {
    if (_0x44c43b === "__proto__") {
      return;
    }
    const _0x4d741a = Object.prototype.hasOwnProperty.call(_0x141d4f, _0x44c43b) ? _0x141d4f[_0x44c43b] : _0x141d4f[_0x44c43b] = {
      interno: 0,
      externo: 0,
      pequeno: 0
    };
    _0x4d741a[_0x362cc0] = Math.max(0, (_0x4d741a[_0x362cc0] || 0) + _0x4bb337);
  }
  function __clasifAjustar(_0x1b41e, _0x4a445c, _0x2e2651, _0x9f4db4) {
    const _0x2a9538 = __clasifStore();
    if (_0x1b41e) {
      __clasifVoto(_0x2a9538.ref, String(_0x1b41e).toLowerCase(), _0x2e2651, _0x9f4db4);
    }
    __clasifPalabras(_0x4a445c).forEach(_0xfae24f => __clasifVoto(_0x2a9538.pal, _0xfae24f, _0x2e2651, _0x9f4db4));
  }
  function __clasifSimilitud(_0x2f9a67, _0x52883f) {
    const _0x52e242 = _0x2f9a67.filter(_0x48f941 => _0x52883f.indexOf(_0x48f941) >= 0).length;
    return _0x52e242 / (_0x2f9a67.length + _0x52883f.length - _0x52e242 || 1);
  }
  function __clasifEnPQ(_0x2fc0ef, _0xf194f9) {
    const _0x47a376 = __clasifStore().pq;
    if (_0x47a376.some(_0x5b1843 => _0x5b1843.key === __clasifClavePQ(_0x2fc0ef, _0xf194f9))) {
      return true;
    }
    if (_0x2fc0ef) {
      return false;
    }
    const _0x341ff4 = __clasifFichas(_0xf194f9);
    return !!_0x341ff4.length && _0x47a376.some(_0x55ba0c => __clasifSimilitud(_0x341ff4, __clasifFichas(_0x55ba0c.desc)) >= __REF_AUTO_SIM);
  }
  let __stockIdx = null;
  let __stockFirma = "";
  function __stockIndice() {
    const _0x221004 = estado.catalog || [];
    let _0x11fc3a = _0x221004.length;
    _0x221004.forEach(_0x1139a0 => {
      _0x11fc3a = _0x11fc3a * 31 + String(_0x1139a0.code || "").length * 7 + String(_0x1139a0.desc || "").length * 3 + String(_0x1139a0.referencia || "").length | 0;
    });
    if (__stockIdx && __stockFirma === _0x11fc3a) {
      return __stockIdx;
    }
    const _0x4b29e8 = new Set();
    const _0x32b205 = _0x221004.map(_0x3df081 => {
      const _0x96bfdd = new Set(__clasifFichas(_0x3df081.code + " " + _0x3df081.desc + " " + (_0x3df081.referencia || "")));
      _0x96bfdd.forEach(_0x519d2d => _0x4b29e8.add(_0x519d2d));
      return {
        c: _0x3df081,
        f: _0x96bfdd
      };
    });
    __stockFirma = _0x11fc3a;
    __stockIdx = {
      items: _0x32b205,
      palabras: _0x4b29e8
    };
    return __stockIdx;
  }
  function __stockCoincidencia(_0x1e3987) {
    const _0x11ec10 = __clasifFichas(_0x1e3987);
    const _0x5e3561 = _0x11ec10.filter(_0x43172a => _0x43172a.length >= 3 && !/\d/.test(_0x43172a));
    if (!_0x5e3561.length) {
      return {
        hay: true,
        unica: null
      };
    }
    const _0x395e43 = __stockIndice();
    if (!_0x5e3561.some(_0x26e14d => _0x395e43.palabras.has(_0x26e14d))) {
      return {
        hay: false,
        unica: null
      };
    }
    const _0x12987a = _0x395e43.items.filter(_0x3dc523 => _0x11ec10.every(_0x21e45b => _0x3dc523.f.has(_0x21e45b)) && __clasifNumerosCompatibles(_0x1e3987, _0x3dc523.c.code + " " + _0x3dc523.c.desc + " " + (_0x3dc523.c.referencia || "")));
    return {
      hay: true,
      unica: _0x12987a.length === 1 ? _0x12987a[0].c : null
    };
  }
  function __clasifRegistrarAsoc(_0x13075d, _0x2ee157, _0x5f4d3e) {
    const _0x5ce244 = __clasifFichas(_0x13075d);
    if (!_0x5ce244.length || !_0x2ee157) {
      return;
    }
    const _0x4385f7 = __clasifStore();
    const _0x4e17ef = _0x5ce244.join(" ");
    const _0x4a386b = _0x4385f7.asoc[_0x4e17ef] = _0x4385f7.asoc[_0x4e17ef] || {
      c: {},
      t: 0
    };
    _0x4a386b.c[_0x2ee157] = Math.max(0, (_0x4a386b.c[_0x2ee157] || 0) + _0x5f4d3e);
    if (!_0x4a386b.c[_0x2ee157]) {
      delete _0x4a386b.c[_0x2ee157];
    }
    _0x4a386b.t = Date.now();
    if (!Object.keys(_0x4a386b.c).length) {
      delete _0x4385f7.asoc[_0x4e17ef];
    }
    const _0x223f5f = Object.keys(_0x4385f7.asoc);
    if (_0x223f5f.length > 600) {
      _0x223f5f.sort((_0x422814, _0xd635bd) => _0x4385f7.asoc[_0x422814].t - _0x4385f7.asoc[_0xd635bd].t).slice(0, _0x223f5f.length - 600).forEach(_0x1e54a4 => delete _0x4385f7.asoc[_0x1e54a4]);
    }
  }
  function __clasifSugerirRef(_0x5e6d0c, _0x4f1889) {
    const _0x18aeec = __clasifFichas(_0x5e6d0c);
    if (!_0x18aeec.length) {
      return null;
    }
    const _0x2db99d = __clasifStore();
    let _0x1ad2ec = null;
    for (const _0x42e62a in _0x2db99d.asoc) {
      const _0x378c08 = _0x42e62a.split(" ");
      const _0x24f6f4 = _0x378c08.filter(_0x40eb34 => _0x18aeec.indexOf(_0x40eb34) >= 0);
      if (!_0x24f6f4.some(_0x2dace4 => _0x2dace4.length >= 3 && !/\d/.test(_0x2dace4))) {
        continue;
      }
      const _0x2675ee = _0x24f6f4.length / (_0x378c08.length + _0x18aeec.length - _0x24f6f4.length);
      if (_0x2675ee < 0.5) {
        continue;
      }
      for (const _0x180561 in _0x2db99d.asoc[_0x42e62a].c) {
        if (_0x180561 === _0x4f1889) {
          continue;
        }
        const _0x4c8179 = buscarPorCodigo(_0x180561);
        if (!_0x4c8179) {
          continue;
        }
        const _0x5bb944 = _0x2db99d.asoc[_0x42e62a].c[_0x180561];
        if (!_0x1ad2ec || _0x2675ee > _0x1ad2ec.sim || _0x2675ee === _0x1ad2ec.sim && _0x5bb944 > _0x1ad2ec.votos) {
          _0x1ad2ec = {
            cat: _0x4c8179,
            sim: _0x2675ee,
            votos: _0x5bb944
          };
        }
      }
    }
    return _0x1ad2ec;
  }
  function __clasifAsignarRef(_0x472896, _0x5df21c, _0x185d19) {
    const _0x536f54 = _0x5df21c.textoLibre || _0x5df21c.textoOrig || "";
    _0x5df21c.textoOrig = _0x536f54;
    _0x5df21c.itemId = _0x185d19.id;
    _0x5df21c.code = _0x185d19.code;
    _0x5df21c.desc = _0x185d19.desc;
    _0x5df21c.referencia = _0x185d19.referencia || "";
    delete _0x5df21c.textoLibre;
    delete _0x5df21c.asocRechazada;
    __clasifRegistrarAsoc(_0x536f54, _0x185d19.code, 1);
    anadirMensajeChat(_0x472896.chat, "Asociado a " + _0x185d19.code + " — " + _0x185d19.desc);
  }
  function __clasifCompacto(_0x71c2d0) {
    return String(_0x71c2d0 || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function __clasifRefDirecta(_0xc8790d, _0x564a1b) {
    const _0x3f4672 = String(_0xc8790d || "").split(/\s+/).map(__clasifCompacto).filter(_0x3339f3 => _0x3339f3.length >= 4 && /\d/.test(_0x3339f3));
    if (!_0x3f4672.length) {
      return null;
    }
    return (estado.catalog || []).find(_0x448385 => _0x448385.code !== _0x564a1b && _0x3f4672.some(_0x42a6c7 => __clasifCompacto(_0x448385.code) === _0x42a6c7 || _0x448385.referencia && __clasifCompacto(_0x448385.referencia) === _0x42a6c7)) || null;
  }
  function __clasifValidarRef(_0x13f0b4, _0x23cbcf) {
    __clasifRegistrarAsoc(_0x23cbcf.textoOrig, _0x23cbcf.code, 1);
    delete _0x23cbcf.refAuto;
    anadirMensajeChat(_0x13f0b4.chat, "Asociado a " + _0x23cbcf.code + " — " + _0x23cbcf.desc);
  }
  function __clasifDeshacerRef(_0x2941cf) {
    _0x2941cf.asocRechazada = _0x2941cf.code;
    _0x2941cf.textoLibre = _0x2941cf.textoOrig;
    _0x2941cf.itemId = null;
    _0x2941cf.code = "";
    _0x2941cf.desc = "";
    _0x2941cf.referencia = "";
    delete _0x2941cf.refAuto;
  }
  let __iaIntentado = new Set();
  let __iaEnCurso = false;
  function __iaAutomatico(_0x359e48, _0x2d264f) {
    const _0x45a937 = __clasifStore();
    if (!_0x45a937.ia.auto || __iaEnCurso || _0x2d264f.length < __IA_MIN_AUTO) {
      return;
    }
    const _0x41789f = new Date().toISOString().slice(0, 10);
    if (_0x45a937.ia.dia.f === _0x41789f && _0x45a937.ia.dia.n >= __IA_MAX_DIA) {
      return;
    }
    const _0x5ac057 = _0x2d264f.filter(_0x4c6df3 => !__iaIntentado.has(_0x4c6df3.clave));
    if (_0x5ac057.length < __IA_MIN_AUTO) {
      return;
    }
    _0x2d264f.forEach(_0x1b36c9 => __iaIntentado.add(_0x1b36c9.clave));
    __iaEnCurso = true;
    setTimeout(async () => {
      try {
        await __iaConsultar(_0x359e48);
      } finally {
        __iaEnCurso = false;
      }
      __clasifPostRender();
    }, 0);
  }
  function __iaPendientes(_0x113a56) {
    const _0x1f0122 = {};
    const _0x38c122 = [];
    _0x113a56.forEach(_0x376b8e => {
      if (_0x376b8e.tipo && (_0x376b8e.code || !_0x376b8e.textoLibre)) {
        return;
      }
      const _0xe0da70 = __iaClave(_0x376b8e);
      if (_0xe0da70 === "t:" || _0x1f0122[_0xe0da70] || __clasifStore().ia.cache[_0xe0da70]) {
        return;
      }
      const _0x5c2142 = !_0x376b8e.code && !!_0x376b8e.textoLibre && !__clasifSugerirRef(_0x376b8e.textoLibre, _0x376b8e.asocRechazada);
      const _0x3f4ca4 = __clasifPredecir(_0x376b8e.code, __clasifTextoLinea(_0x376b8e));
      const _0x5da1af = !_0x376b8e.tipo && (!_0x3f4ca4 || _0x3f4ca4.origen === "defecto");
      if (!_0x5c2142 && !_0x5da1af) {
        return;
      }
      _0x1f0122[_0xe0da70] = true;
      _0x38c122.push({
        it: _0x376b8e,
        clave: _0xe0da70,
        ref: _0x5c2142
      });
    });
    return _0x38c122;
  }
  function __iaIndice() {
    const _0x38f9b2 = new Map();
    (estado.catalog || []).forEach(_0x585b51 => {
      __clasifFichas(_0x585b51.code + " " + _0x585b51.desc + " " + (_0x585b51.referencia || "")).forEach(_0x4d69bb => {
        if (!_0x38f9b2.has(_0x4d69bb)) {
          _0x38f9b2.set(_0x4d69bb, []);
        }
        _0x38f9b2.get(_0x4d69bb).push(_0x585b51);
      });
    });
    return _0x38f9b2;
  }
  function __iaCandidatos(_0x141297, _0xdc208e) {
    const _0x28b7d1 = new Map();
    __clasifFichas(_0x141297).forEach(_0x16f1c8 => {
      (_0xdc208e.get(_0x16f1c8) || []).forEach(_0x23c052 => _0x28b7d1.set(_0x23c052, (_0x28b7d1.get(_0x23c052) || 0) + (/\d/.test(_0x16f1c8) ? 1.5 : 1)));
    });
    return [..._0x28b7d1.entries()].filter(_0x21cf33 => _0x21cf33[1] >= 1).sort((_0x43bf4c, _0x8c7371) => _0x8c7371[1] - _0x43bf4c[1] || String(_0x43bf4c[0].desc).length - String(_0x8c7371[0].desc).length).slice(0, __IA_MAX_CANDIDATOS).map(_0x13210e => _0x13210e[0]);
  }
  function __iaCorto(_0x4520f5, _0x2c7b84) {
    const _0x2692f7 = String(_0x4520f5 || "").replace(/\s+/g, " ").trim();
    if (_0x2692f7.length > _0x2c7b84) {
      return _0x2692f7.slice(0, _0x2c7b84);
    } else {
      return _0x2692f7;
    }
  }
  function __iaConstruirConsulta(_0x1a2ae1) {
    const _0x58df04 = _0x1a2ae1.some(_0x79d3e0 => _0x79d3e0.ref) ? __iaIndice() : null;
    const _0x5dac51 = [];
    _0x1a2ae1.forEach((_0x293faa, _0x48f405) => {
      const _0x5ca02a = __iaCorto(_0x293faa.it.code ? _0x293faa.it.code + " " + _0x293faa.it.desc : _0x293faa.it.textoLibre || _0x293faa.it.textoOrig || _0x293faa.it.desc, 60);
      _0x293faa.cand = _0x293faa.ref ? __iaCandidatos(_0x5ca02a, _0x58df04) : [];
      _0x5dac51.push(_0x48f405 + 1 + "|" + _0x5ca02a + "|" + _0x293faa.cand.map((_0x241034, _0x4bcacb) => String.fromCharCode(65 + _0x4bcacb) + ":" + __iaCorto(_0x241034.code, 20) + " " + __iaCorto(_0x241034.desc, 40)).join(";"));
    });
    return "Almacén industrial. Por cada línea indica: 1) la referencia del stock si es claramente la misma pieza, eligiendo SOLO entre las opciones dadas (letra) o \"-\" si ninguna; 2) el tipo: i=interno (se tiene en stock propio), e=externo (se compra fuera), p=pequeño material (tornillería, bridas, consumibles baratos). Responde SOLO un JSON [[n,\"letra o -\",\"i|e|p\"],...], sin texto ni markdown.\n" + _0x5dac51.join("\n");
  }
  const __IA_TIPOS = {
    i: "interno",
    e: "externo",
    p: "pequeno"
  };
  async function __iaConsultar(_0x240658) {
    const _0xc00c97 = __clasifStore();
    const _0x555249 = new Date().toISOString().slice(0, 10);
    if (_0xc00c97.ia.dia.f !== _0x555249) {
      _0xc00c97.ia.dia = {
        f: _0x555249,
        n: 0
      };
    }
    if (_0xc00c97.ia.dia.n >= __IA_MAX_DIA) {
      _0x279f78("Límite diario de consultas a la IA alcanzado.");
      return false;
    }
    const _0x5007ee = __iaPendientes(_0x240658.pendiente.items || []).slice(0, __IA_MAX_LINEAS);
    if (!_0x5007ee.length) {
      return false;
    }
    const _0x443c67 = __iaConstruirConsulta(_0x5007ee);
    _0xc00c97.ia.dia.n++;
    __guardarClasif();
    const _0x16ce28 = new AbortController();
    const _0x42c53f = setTimeout(() => _0x16ce28.abort(), 30000);
    try {
      const _0x2985fc = await __proxyFetch({
        prompt: _0x443c67,
        imagenes: []
      }, _0x16ce28.signal);
      const _0x87f183 = await __geminiParsearRespuesta(_0x2985fc, true);
      let _0x235d50 = 0;
      _0x87f183.forEach(_0x175f73 => {
        const _0x3520cc = Array.isArray(_0x175f73) ? _0x5007ee[(parseInt(_0x175f73[0], 10) || 0) - 1] : null;
        if (!_0x3520cc) {
          return;
        }
        const _0x41c5d7 = String(_0x175f73[1] || "").trim().toUpperCase();
        const _0x4edf7 = _0x3520cc.ref && _0x41c5d7.length === 1 ? _0x3520cc.cand[_0x41c5d7.charCodeAt(0) - 65] : null;
        const _0x384f1e = __IA_TIPOS[String(_0x175f73[2] || "").trim().toLowerCase()] || "";
        _0xc00c97.ia.cache[_0x3520cc.clave] = {
          r: _0x4edf7 ? _0x4edf7.code : "",
          t: _0x384f1e,
          ts: Date.now()
        };
        if (_0x4edf7 || _0x384f1e) {
          _0x235d50++;
        }
      });
      _0x5007ee.forEach(_0x486c12 => {
        if (!_0xc00c97.ia.cache[_0x486c12.clave]) {
          _0xc00c97.ia.cache[_0x486c12.clave] = {
            r: "",
            t: "",
            ts: Date.now()
          };
        }
      });
      const _0x5bd37c = Object.keys(_0xc00c97.ia.cache);
      if (_0x5bd37c.length > __IA_MAX_CACHE) {
        _0x5bd37c.sort((_0xb8d366, _0x1e85da) => _0xc00c97.ia.cache[_0xb8d366].ts - _0xc00c97.ia.cache[_0x1e85da].ts).slice(0, _0x5bd37c.length - __IA_MAX_CACHE).forEach(_0x2e05f8 => delete _0xc00c97.ia.cache[_0x2e05f8]);
      }
      __guardarClasif();
      _0x279f78("IA: " + _0x235d50 + " sugerencia" + (_0x235d50 === 1 ? "" : "s") + " (consulta " + _0xc00c97.ia.dia.n + "/" + __IA_MAX_DIA + " de hoy). Quedan por confirmar.");
      return true;
    } catch (_0x1d83ce) {
      _0x279f78("La IA no ha respondido: " + __errorAmable(_0x1d83ce) + ". No se ha guardado nada.");
      return false;
    } finally {
      clearTimeout(_0x42c53f);
    }
  }
  function __clasifTextoLinea(_0x593f0e) {
    return (_0x593f0e.textoOrig || _0x593f0e.textoLibre || "") + " " + (_0x593f0e.desc || "");
  }
  function __iaClave(_0x354035) {
    const _0x5bdd63 = _0x354035.textoLibre || _0x354035.textoOrig;
    if (_0x5bdd63 || !_0x354035.code) {
      return "t:" + __clasifFichas(_0x5bdd63 || _0x354035.desc).join(" ");
    } else {
      return "c:" + String(_0x354035.code).toLowerCase();
    }
  }
  function __iaEntrada(_0x51bad9) {
    return __clasifStore().ia.cache[__iaClave(_0x51bad9)] || null;
  }
  function __iaRef(_0x7e96b8) {
    const _0x4b29bb = !_0x7e96b8.code && __iaEntrada(_0x7e96b8);
    const _0x5d6525 = _0x4b29bb && _0x4b29bb.r ? buscarPorCodigo(_0x4b29bb.r) : null;
    if (_0x5d6525) {
      return {
        cat: _0x5d6525,
        ia: true
      };
    } else {
      return null;
    }
  }
  function __errorAmable(_0x456164) {
    const _0x5f3b09 = String(_0x456164 && _0x456164.message || "");
    if (/failed to fetch|networkerror|load failed|network/i.test(_0x5f3b09)) {
      return "no hay conexión con el servicio. Revisa la conexión a internet e inténtalo de nuevo";
    }
    if (/429|quota|rate|limit/i.test(_0x5f3b09)) {
      return "se alcanzó el límite de consultas de la IA. Se podrá volver a usar más tarde";
    }
    if (/timeout|timed out|abort/i.test(_0x5f3b09)) {
      return "el servicio tardó demasiado en responder. Inténtalo de nuevo";
    }
    return _0x5f3b09 || "error desconocido";
  }
  function __clasifAsociar(_0x14755d, _0x4ffe10) {
    try {
      if (_0x2df77d() !== "almacen") {
        return;
      }
      _0x14755d.textoOrig = _0x14755d.textoLibre || _0x14755d.textoOrig || "";
      __clasifRegistrarAsoc(_0x14755d.textoOrig, _0x4ffe10.code, 1);
      if (__clasifEnPQ("", _0x14755d.textoOrig)) {
        __clasifRegistrarPQ({
          code: _0x4ffe10.code,
          desc: _0x4ffe10.desc,
          textoOrig: _0x14755d.textoOrig
        });
      }
      __guardarClasif();
    } catch (_0x46b1ad) {}
  }
  function __clasifNombreLinea(_0x185203) {
    if (_0x185203.code) {
      return _0x185203.code + " — " + (_0x185203.desc || "");
    } else {
      return _0x185203.textoLibre || _0x185203.textoOrig || _0x185203.desc || "(sin descripción)";
    }
  }
  function __clasifFecha(_0x45793a) {
    return new Date(_0x45793a).toLocaleDateString("es-ES");
  }
  function __clasifRegistrarPeticion(_0x6bcf9d, _0x21562c) {
    const _0x310260 = __clasifStore();
    _0x310260.peticiones.push(_0x6bcf9d);
    if (_0x310260.peticiones.length > 200) {
      _0x310260.peticiones.splice(0, _0x310260.peticiones.length - 200);
    }
    _0x21562c.forEach(_0x233004 => {
      _0x233004.extPeticion = _0x6bcf9d.id;
    });
    __clasifGuardarPronto();
  }
  function __clasifAnularPeticion(_0x449c54, _0x57cfb3) {
    const _0xa7933 = __clasifStore();
    _0xa7933.peticiones = _0xa7933.peticiones.filter(_0x1943e4 => _0x1943e4.id !== _0x449c54.id);
    _0x57cfb3.forEach(_0x196c56 => {
      if (_0x196c56.extPeticion === _0x449c54.id) {
        delete _0x196c56.extPeticion;
      }
    });
    __clasifGuardarPronto();
  }
  function __clasifTextoInterno(_0x48b813) {
    const _0x1a0bb0 = estado.mode;
    const _0x3f956b = estado.current[_0x1a0bb0] || "";
    const _0x55e454 = _0x1a0bb0 === "montaje" ? "montaje" : "proyecto";
    const _0x12319e = _0x48b813.map(_0x39d1eb => {
      const _0x3f9f9d = parseInt(_0x39d1eb.qty, 10) || 1;
      return "- " + __clasifNombreLinea(_0x39d1eb) + " — " + _0x3f9f9d + (_0x3f9f9d === 1 ? " unidad" : " unidades") + (_0x39d1eb.tipo === "pequeno" ? " [pequeño material]" : "");
    });
    return "Listado de material interno de la orden «" + _0x3f956b + "» (" + _0x55e454 + "):\n\n" + _0x12319e.join("\n");
  }
  function __clasifCopiar(_0x2d4a79) {
    const _0x282697 = () => {
      const _0x1dc3a2 = document.createElement("textarea");
      _0x1dc3a2.value = _0x2d4a79;
      _0x1dc3a2.style.cssText = "position:fixed; opacity:0;";
      document.body.appendChild(_0x1dc3a2);
      _0x1dc3a2.select();
      try {
        document.execCommand("copy");
      } catch (_0x4970d8) {}
      _0x1dc3a2.remove();
      _0x279f78("Texto copiado.");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(_0x2d4a79).then(() => _0x279f78("Texto copiado."), _0x282697);
    } else {
      _0x282697();
    }
  }
  async function __proxyFetch(_0x1e6aa3, _0xe2fd09) {
    let _0x1505d5 = "";
    try {
      _0x1505d5 = firebaseAuth && firebaseAuth.currentUser ? await firebaseAuth.currentUser.getIdToken() : "";
    } catch (_0x495502) {}
    return fetch(__GEMINI_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(Object.assign({
        token: _0x1505d5
      }, _0x1e6aa3)),
      signal: _0xe2fd09
    });
  }
  async function __proxyAccion(_0x339844, _0x566990) {
    const _0x46bc4f = await __proxyFetch(Object.assign({
      accion: _0x339844
    }, _0x566990));
    const _0x25f122 = await _0x46bc4f.json();
    if (!_0x25f122 || !_0x25f122.ok) {
      throw new Error(_0x25f122 && _0x25f122.error || "Sin respuesta del servidor.");
    }
    return _0x25f122;
  }
  function __clasifAbrirCorreo(_0x2ded44, _0x563ac3) {
    const _0x4502c2 = (__clasifStore().email || "").trim();
    const _0x3b806f = document.createElement("a");
    _0x3b806f.href = "mailto:" + encodeURIComponent(_0x4502c2) + "?subject=" + encodeURIComponent(_0x563ac3) + "&body=" + encodeURIComponent(_0x2ded44);
    document.body.appendChild(_0x3b806f);
    _0x3b806f.click();
    _0x3b806f.remove();
  }
  const __clasifAbiertos = new Set();
  function __clasifPlegables() {
    ["clasifInterno", "textoPanel"].forEach(_0x381b14 => {
      const _0x1f7ea8 = document.getElementById(_0x381b14);
      const _0x3b5a72 = _0x1f7ea8 && _0x1f7ea8.querySelector(".panel-title");
      if (!_0x3b5a72) {
        return;
      }
      _0x1f7ea8.classList.add("clasif-plegable");
      _0x1f7ea8.classList.toggle("cerrado", !__clasifAbiertos.has(_0x381b14));
      _0x3b5a72.addEventListener("click", () => {
        if (__clasifAbiertos.has(_0x381b14)) {
          __clasifAbiertos.delete(_0x381b14);
        } else {
          __clasifAbiertos.add(_0x381b14);
        }
        _0x1f7ea8.classList.toggle("cerrado");
      });
    });
  }
  function __clasifPestanaVisible() {
    const _0x43c568 = document.querySelector(".chat-tabs-row");
    const _0x5a6896 = _0x43c568 && _0x43c568.querySelector(".mode-btn.active");
    if (_0x5a6896 && _0x43c568.scrollWidth > _0x43c568.clientWidth) {
      _0x43c568.scrollLeft += _0x5a6896.getBoundingClientRect().left - _0x43c568.getBoundingClientRect().left - (_0x43c568.clientWidth - _0x5a6896.offsetWidth) / 2;
    }
  }
  const __RESPALDO_INTERVALO_MS = 1800000;
  const __RESPALDO_MAX_CHARS = 6000000;
  function __clasifMinimo(_0x56ea6d) {
    if (Number.isFinite(_0x56ea6d.minimo)) {
      return _0x56ea6d.minimo;
    } else {
      return estado.settings.stockBajoUmbral;
    }
  }
  let __respaldoUltimo = 0;
  let __respaldoFirma = "";
  function __respaldoSincronizar() {
    try {
      const _0x3f73e7 = estado;
      if (_0x2df77d() !== "almacen" || !(_0x3f73e7.catalog || []).length || Date.now() - __respaldoUltimo < __RESPALDO_INTERVALO_MS) {
        return;
      }
      __respaldoUltimo = Date.now();
      const _0x50d876 = _0x41ba69().map(_0x4d5688 => ({
        code: _0x4d5688.code,
        desc: _0x4d5688.desc || "",
        qty: _0x4d5688.qty,
        min: __clasifMinimo(_0x4d5688)
      }));
      const _0x4f58ba = {
        catalog: _0x3f73e7.catalog,
        movements: (_0x3f73e7.movements || []).slice(-1000),
        groups: _0x3f73e7.groups,
        deliveries: _0x3f73e7.deliveries,
        ubicaciones: _0x3f73e7.ubicaciones,
        trabajadores: _0x3f73e7.trabajadores,
        clasificacion: _0x3f73e7.clasificacion,
        settings: _0x3f73e7.settings
      };
      const _0x3e5392 = JSON.stringify(_0x4f58ba);
      if (_0x3e5392.length > __RESPALDO_MAX_CHARS) {
        return;
      }
      let _0x5c167d = 2166136261;
      for (let _0x113280 = 0; _0x113280 < _0x3e5392.length; _0x113280++) {
        _0x5c167d = Math.imul(_0x5c167d ^ _0x3e5392.charCodeAt(_0x113280), 16777619);
      }
      const _0x2fff62 = _0x3e5392.length + ":" + (_0x5c167d >>> 0);
      if (_0x2fff62 === __respaldoFirma) {
        return;
      }
      __respaldoFirma = _0x2fff62;
      __proxyAccion("respaldo", {
        umbral: _0x3f73e7.settings.stockBajoUmbral,
        bajo: _0x50d876,
        datos: _0x4f58ba
      }).catch(() => {
        __respaldoFirma = "";
      });
    } catch (_0x1ecefe) {}
  }
  let __pushIniciado = false;
  function __pushRuta() {
    const _0x498786 = location.pathname.replace(/[^/]*$/, "");
    return {
      path: _0x498786.slice(1) + "OneSignalSDKWorker.js",
      scope: _0x498786 + "push-scope/"
    };
  }
  function __pushIniciar() {
    const _0x467170 = (estado.settings.onesignalAppId || "").trim();
    if (!_0x467170 || __pushIniciado) {
      return;
    }
    __pushIniciado = true;
    window.OneSignalDeferred = window.OneSignalDeferred || [];
    const _0x27ec3b = __pushRuta();
    window.OneSignalDeferred.push(_0xda71e8 => _0xda71e8.init({
      appId: _0x467170,
      serviceWorkerPath: _0x27ec3b.path,
      serviceWorkerParam: {
        scope: _0x27ec3b.scope
      },
      autoResubscribe: true
    }));
    const _0x264c43 = document.createElement("script");
    _0x264c43.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
    _0x264c43.defer = true;
    document.head.appendChild(_0x264c43);
  }
  function __pushPanel() {
    const _0x5c8ce6 = $("#setBobinaDias");
    const _0x304cf3 = document.getElementById("pushPanel");
    if (_0x304cf3) {
      _0x304cf3.remove();
    }
    const _0x27e0f3 = _0x5c8ce6 && _0x5c8ce6.closest(".panel");
    if (_0x2df77d() !== "almacen" || !_0x27e0f3) {
      return;
    }
    const _0x5af903 = (estado.settings.onesignalAppId || "").trim();
    const _0x354a0d = document.createElement("div");
    _0x354a0d.className = "panel";
    _0x354a0d.id = "pushPanel";
    _0x354a0d.style.marginTop = "14px";
    _0x354a0d.innerHTML = "<p class=\"panel-title\">Notificaciones push</p><p style=\"font-size:12px; color:var(--text-muted); margin:0 0 8px;\">Avisos en este dispositivo con la app cerrada (petición de material enviada, stock bajo). Requiere una cuenta gratuita de OneSignal; en iPhone, iOS 16.4 o superior y la app añadida a la pantalla de inicio.</p><div class=\"manual-stock-form\" style=\"flex-direction:column;\"><input type=\"text\" id=\"pushAppId\" placeholder=\"ID de la aplicación de OneSignal\" value=\"" + _0x1d1ab0(_0x5af903) + "\" style=\"width:100%;\"><button class=\"cam-btn\" id=\"pushGuardarBtn\">Guardar ID</button></div>" + (_0x5af903 ? "<p id=\"pushEstado\" style=\"font-size:12.5px; margin:10px 0 6px;\"></p><button class=\"btn primary\" id=\"pushActivarBtn\" style=\"width:100%;\"></button>" : "");
    _0x27e0f3.after(_0x354a0d);
    $("#pushGuardarBtn").addEventListener("click", () => {
      estado.settings.onesignalAppId = $("#pushAppId").value.trim();
      guardar("settings", estado.settings);
      _0x279f78(estado.settings.onesignalAppId ? "ID guardado." : "ID eliminado.");
      __pushIniciar();
      render();
    });
    if (!_0x5af903) {
      return;
    }
    __pushIniciar();
    const _0x3d19be = $("#pushEstado");
    const _0x1a1a16 = $("#pushActivarBtn");
    const _0x4c2fcb = _0x339802 => {
      const _0x5be66a = !!_0x339802.Notifications.permission && !!_0x339802.User.PushSubscription.optedIn;
      _0x3d19be.textContent = _0x339802.Notifications.isPushSupported() ? _0x5be66a ? "Activadas en este dispositivo." : "No activadas en este dispositivo." : "Este navegador no admite notificaciones push.";
      _0x1a1a16.textContent = _0x5be66a ? "Desactivar en este dispositivo" : "Activar en este dispositivo";
      _0x1a1a16.disabled = !_0x339802.Notifications.isPushSupported();
      _0x1a1a16.onclick = async () => {
        if (_0x5be66a) {
          await _0x339802.User.PushSubscription.optOut();
        } else {
          await _0x339802.Notifications.requestPermission();
          await _0x339802.User.PushSubscription.optIn();
        }
        _0x4c2fcb(_0x339802);
      };
    };
    window.OneSignalDeferred.push(_0x4c2fcb);
  }
  function __editarItem() {
    return (estado.catalog || []).find(_0x5bb242 => _0x5bb242.id === _0x16ea10) || null;
  }
  function __editarCampos() {
    const _0x97533 = document.getElementById("editItemCard");
    const _0x470414 = _0x97533 && _0x97533.querySelector("#editArticulo");
    const _0x2fec94 = _0x97533 && _0x97533.querySelector("#editCoste");
    if (!_0x470414 || !_0x2fec94 || _0x97533.querySelector("#editCodigo")) {
      return;
    }
    const _0x3cb319 = __editarItem();
    const _0x41e5fa = document.createElement("input");
    _0x41e5fa.type = "text";
    _0x41e5fa.id = "editCodigo";
    _0x41e5fa.placeholder = "Código";
    _0x41e5fa.autocomplete = "off";
    _0x41e5fa.style.width = "100%";
    _0x41e5fa.value = _0x3cb319 ? _0x3cb319.code : "";
    _0x470414.before(_0x41e5fa);
    const _0x44c1e9 = document.createElement("input");
    _0x44c1e9.type = "number";
    _0x44c1e9.id = "editMinimo";
    _0x44c1e9.min = "0";
    _0x44c1e9.step = "1";
    _0x44c1e9.placeholder = "Stock mínimo (vacío = umbral general)";
    _0x44c1e9.style.width = "100%";
    _0x44c1e9.value = _0x3cb319 && Number.isFinite(_0x3cb319.minimo) ? _0x3cb319.minimo : "";
    _0x2fec94.before(_0x44c1e9);
  }
  function __codigoRenombrar(_0x5cbb53, _0xced3c1) {
    const _0x5be0cb = _0x5cbb53.code;
    const _0x1563ee = estado;
    const _0x285c3d = (_0x1563ee.catalog || []).some(_0x274752 => _0x274752.id !== _0x5cbb53.id && _0x274752.code === _0x5be0cb);
    _0x5cbb53.code = _0xced3c1;
    const _0x5c3a83 = _0x35cfce => {
      if (!_0x35cfce || typeof _0x35cfce !== "object") {
        return 0;
      }
      let _0x3f551a = 0;
      if (Array.isArray(_0x35cfce)) {
        _0x35cfce.forEach(_0xffd8eb => {
          _0x3f551a += _0x5c3a83(_0xffd8eb);
        });
        return _0x3f551a;
      }
      if (_0x35cfce.code === _0x5be0cb && (_0x35cfce.itemId === _0x5cbb53.id || _0x35cfce.itemId === undefined && !_0x285c3d)) {
        _0x35cfce.code = _0xced3c1;
        _0x3f551a++;
      }
      for (const _0x4522bc in _0x35cfce) {
        _0x3f551a += _0x5c3a83(_0x35cfce[_0x4522bc]);
      }
      return _0x3f551a;
    };
    _0x5c3a83(_0x1563ee.movements);
    _0x5c3a83(_0x1563ee.deliveries);
    const _0x24d2fa = Object.keys(_0x1563ee.groupData || {}).filter(_0x412b6d => _0x5c3a83(_0x1563ee.groupData[_0x412b6d]) > 0);
    const _0x5b7593 = __clasifStore();
    const _0x1da4c1 = String(_0x5be0cb).toLowerCase();
    const _0x1a3868 = String(_0xced3c1).toLowerCase();
    if (!_0x285c3d && _0x5b7593.ref[_0x1da4c1]) {
      const _0x23b72b = _0x5b7593.ref[_0x1da4c1];
      const _0x5b6756 = _0x5b7593.ref[_0x1a3868] = _0x5b7593.ref[_0x1a3868] || {
        interno: 0,
        externo: 0,
        pequeno: 0
      };
      delete _0x5b7593.ref[_0x1da4c1];
      for (const _0x1476d3 in _0x23b72b) {
        _0x5b6756[_0x1476d3] = (_0x5b6756[_0x1476d3] || 0) + _0x23b72b[_0x1476d3];
      }
    }
    if (!_0x285c3d) {
      _0x5b7593.pq.forEach(_0x3fc9a => {
        if (_0x3fc9a.key === "c:" + _0x1da4c1) {
          _0x3fc9a.key = "c:" + _0x1a3868;
          _0x3fc9a.code = _0xced3c1;
        }
      });
    }
    for (const _0x4fa5e6 in _0x5b7593.asoc) {
      const _0x172728 = _0x5b7593.asoc[_0x4fa5e6].c;
      if (!_0x285c3d && _0x172728[_0x5be0cb] !== undefined) {
        _0x172728[_0xced3c1] = (_0x172728[_0xced3c1] || 0) + _0x172728[_0x5be0cb];
        delete _0x172728[_0x5be0cb];
      }
    }
    if (!_0x285c3d) {
      delete _0x5b7593.ia.cache["c:" + _0x1da4c1];
      for (const _0x461796 in _0x5b7593.ia.cache) {
        if (_0x5b7593.ia.cache[_0x461796].r === _0x5be0cb) {
          _0x5b7593.ia.cache[_0x461796].r = _0xced3c1;
        }
      }
    }
    _0x240f8a();
    _0x529094();
    __guardarClasif();
    _0x24d2fa.forEach(_0x185d69 => {
      const _0x294433 = _0x185d69.split("::");
      guardarGrupo(_0x294433[0], _0x294433.slice(1).join("::"));
    });
  }
  function __editarGuardar(_0x2eaa69) {
    if (!_0x2eaa69.target.closest("#saveEditItemBtn")) {
      return;
    }
    const _0x354dfc = document.getElementById("editItemCard");
    const _0x3ab24e = __editarItem();
    if (!_0x3ab24e) {
      return;
    }
    const _0x41a5d1 = _0x354dfc.querySelector("#editCodigo");
    const _0x209a8a = _0x41a5d1 ? _0x41a5d1.value.trim() : _0x3ab24e.code;
    const _0x15399a = _0x279187 => {
      _0x2eaa69.stopImmediatePropagation();
      _0x2eaa69.preventDefault();
      _0x279f78(_0x279187);
    };
    if (!_0x209a8a) {
      _0x15399a("El código no puede quedar vacío.");
      return;
    }
    const _0x2a9015 = _0x354dfc.querySelector("#editMinimo");
    if (_0x2a9015) {
      const _0x3672ba = parseInt(_0x2a9015.value, 10);
      if (Number.isFinite(_0x3672ba) && _0x3672ba >= 0) {
        _0x3ab24e.minimo = _0x3672ba;
      } else {
        delete _0x3ab24e.minimo;
      }
    }
    if (_0x209a8a !== _0x3ab24e.code) {
      __codigoRenombrar(_0x3ab24e, _0x209a8a);
    }
  }
  function __editarIniciar() {
    const _0x2f2cc3 = document.getElementById("editItemCard");
    if (!_0x2f2cc3 || _0x2f2cc3.dataset.editar) {
      return;
    }
    _0x2f2cc3.dataset.editar = "1";
    new MutationObserver(__editarCampos).observe(_0x2f2cc3, {
      childList: true
    });
    _0x2f2cc3.addEventListener("click", __editarGuardar, true);
  }
  const __CHAT_EXT_INTERVALO_MS = 15000;
  let __chatExtUltimo = 0;
  let __chatExtOcupado = false;
  function __chatExtGrupo() {
    const _0xac620d = estado.mode;
    if (_0xac620d !== "montaje" && _0xac620d !== "proyecto") {
      return null;
    }
    const _0x1a9388 = estado.current[_0xac620d];
    if (_0x1a9388) {
      return {
        modo: _0xac620d,
        nombre: _0x1a9388,
        datos: estado.groupData[_0xac620d + "::" + _0x1a9388] || null
      };
    } else {
      return null;
    }
  }
  function __chatExtUrl(_0x4f0b47) {
    const _0x59e88e = new URL("chat.html", location.href);
    _0x59e88e.searchParams.set("u", SUPABASE_URL);
    _0x59e88e.searchParams.set("a", SUPABASE_ANON_KEY);
    _0x59e88e.searchParams.set("ot", _0x4f0b47.id);
    _0x59e88e.searchParams.set("t", _0x4f0b47.token);
    return _0x59e88e.href;
  }
  function __chatExtClave() {
    const _0x370575 = new Uint8Array(16);
    crypto.getRandomValues(_0x370575);
    return Array.from(_0x370575, _0x21d99b => _0x21d99b.toString(16).padStart(2, "0")).join("");
  }
  async function __chatExtCrear(_0x1478aa) {
    const {
      data: _0x4a5e75,
      error: _0x27ea61
    } = await supabaseCliente.from("chat_externo").insert({
      modo: _0x1478aa.modo,
      nombre: _0x1478aa.nombre
    }).select().single();
    if (_0x27ea61) {
      throw _0x27ea61;
    }
    _0x1478aa.datos.chatExt = {
      id: _0x4a5e75.id,
      token: _0x4a5e75.token,
      vistos: []
    };
    guardarGrupo(_0x1478aa.modo, _0x1478aa.nombre);
  }
  async function __chatExtRegenerar(_0x502d5a) {
    const _0x3d92d1 = __chatExtClave();
    const {
      error: _0x51aead
    } = await supabaseCliente.from("chat_externo").update({
      token: _0x3d92d1
    }).eq("id", _0x502d5a.datos.chatExt.id);
    if (_0x51aead) {
      throw _0x51aead;
    }
    _0x502d5a.datos.chatExt.token = _0x3d92d1;
    guardarGrupo(_0x502d5a.modo, _0x502d5a.nombre);
  }
  function __chatExtAplicar(_0x2981e6, _0x469d1e) {
    const _0x2c35c3 = _0x469d1e.codigo ? buscarPorCodigo(_0x469d1e.codigo) : null;
    const _0x576e18 = Math.max(1, parseInt(_0x469d1e.cantidad, 10) || 1);
    if (!_0x2981e6.pendiente.requesterName) {
      _0x2981e6.pendiente.requesterName = _0x469d1e.autor;
    }
    const _0x28642c = _0x2c35c3 && _0x2981e6.pendiente.items.find(_0x1aceaa => _0x1aceaa.itemId === _0x2c35c3.id);
    if (_0x28642c) {
      _0x28642c.qty += _0x576e18;
    } else {
      _0x2981e6.pendiente.items.push(_0x2c35c3 ? {
        id: nuevoId(),
        itemId: _0x2c35c3.id,
        code: _0x2c35c3.code,
        desc: _0x2c35c3.desc,
        referencia: _0x2c35c3.referencia || "",
        qty: _0x576e18,
        pedido: 0,
        reserva: 0
      } : {
        id: nuevoId(),
        itemId: null,
        code: "",
        desc: "",
        referencia: "",
        textoLibre: _0x469d1e.texto,
        qty: _0x576e18,
        pedido: 0,
        reserva: 0,
        destino: ""
      });
    }
    anadirMensajeChat(_0x2981e6.chat, "Taller (app externa) · " + _0x469d1e.autor + ": " + _0x469d1e.texto + " × " + _0x576e18);
  }
  async function __chatExtSincronizar() {
    if (!supabaseCliente || __chatExtOcupado || Date.now() - __chatExtUltimo < __CHAT_EXT_INTERVALO_MS) {
      return;
    }
    const _0x35ba6c = Object.keys(estado.groupData).filter(_0xce61e4 => estado.groupData[_0xce61e4] && estado.groupData[_0xce61e4].chatExt);
    if (!_0x35ba6c.length) {
      return;
    }
    __chatExtUltimo = Date.now();
    __chatExtOcupado = true;
    try {
      const _0xcc0074 = _0x35ba6c.map(_0x21857b => estado.groupData[_0x21857b].chatExt.id);
      const {
        data: _0x270157,
        error: _0x521fd5
      } = await supabaseCliente.from("chat_externo_mensajes").select("*").in("ot_id", _0xcc0074).eq("importado", false).order("created_at", {
        ascending: true
      }).limit(200);
      if (_0x521fd5 || !_0x270157 || !_0x270157.length) {
        return;
      }
      const _0xcfc8d0 = new Set();
      _0x270157.forEach(_0x3fa4f7 => {
        const _0x3224d4 = _0x35ba6c.find(_0x27a7bc => estado.groupData[_0x27a7bc].chatExt.id === _0x3fa4f7.ot_id);
        if (!_0x3224d4) {
          return;
        }
        const _0x39add2 = estado.groupData[_0x3224d4];
        if (_0x39add2.chatExt.vistos.includes(_0x3fa4f7.id)) {
          return;
        }
        __chatExtAplicar(_0x39add2, _0x3fa4f7);
        _0x39add2.chatExt.vistos.push(_0x3fa4f7.id);
        if (_0x39add2.chatExt.vistos.length > 400) {
          _0x39add2.chatExt.vistos.splice(0, _0x39add2.chatExt.vistos.length - 400);
        }
        _0xcfc8d0.add(_0x3224d4);
      });
      _0xcfc8d0.forEach(_0x14a67a => {
        const _0x2430c1 = _0x14a67a.split("::");
        guardarGrupo(_0x2430c1[0], _0x2430c1.slice(1).join("::"));
      });
      await supabaseCliente.from("chat_externo_mensajes").update({
        importado: true
      }).in("id", _0x270157.map(_0x5a73de => _0x5a73de.id));
      if (_0xcfc8d0.size) {
        render();
      }
    } catch (_0x434e87) {} finally {
      __chatExtOcupado = false;
    }
  }
  function __chatExtPanel() {
    const _0x5b04e1 = document.getElementById("chatExtPanel");
    if (_0x5b04e1) {
      _0x5b04e1.remove();
    }
    const _0x347dec = __chatExtGrupo();
    const _0xaa91d6 = $(".chat-tabs-row");
    if (!supabaseCliente || _0x2df77d() !== "almacen" || _0x5592da !== "chat" || !_0x347dec || !_0x347dec.datos || !_0xaa91d6) {
      return;
    }
    const _0x4ac14b = _0x347dec.datos.chatExt;
    const _0x200324 = document.createElement("div");
    _0x200324.className = "panel";
    _0x200324.id = "chatExtPanel";
    _0x200324.style.marginTop = "10px";
    _0x200324.innerHTML = "<p class=\"panel-title\">Chat externo de Taller</p><p style=\"font-size:12px; color:var(--text-muted); margin:0 0 8px;\">" + (_0x4ac14b ? "El enlace muestra el chat de esta orden dentro de otra aplicación. Los mensajes recibidos pasan solos a la solicitud pendiente." : "Genera un enlace para mostrar el chat de esta orden dentro de otra aplicación.") + "</p><div class=\"scanner-row\">" + (_0x4ac14b ? "<button type=\"button\" class=\"cam-btn\" id=\"chatExtCopiarBtn\" style=\"flex:1;\">Copiar enlace</button><button type=\"button\" class=\"cam-btn\" id=\"chatExtRegenerarBtn\" style=\"flex:1;\">Regenerar enlace</button>" : "<button type=\"button\" class=\"btn primary\" id=\"chatExtCrearBtn\" style=\"flex:1;\">Crear enlace de chat</button>") + "</div>";
    _0xaa91d6.after(_0x200324);
    const _0x1afab2 = _0x183b31 => _0x279f78("No se pudo completar: " + __errorAmable(_0x183b31));
    if (!_0x4ac14b) {
      $("#chatExtCrearBtn").addEventListener("click", async () => {
        try {
          await __chatExtCrear(_0x347dec);
          __clasifCopiar(__chatExtUrl(_0x347dec.datos.chatExt));
          render();
        } catch (_0x4ef71d) {
          _0x1afab2(_0x4ef71d);
        }
      });
      return;
    }
    $("#chatExtCopiarBtn").addEventListener("click", () => __clasifCopiar(__chatExtUrl(_0x4ac14b)));
    $("#chatExtRegenerarBtn").addEventListener("click", async () => {
      if (!(await _0x2cc777("¿Regenerar el enlace? El enlace anterior dejará de funcionar y habrá que pegar el nuevo en la otra aplicación."))) {
        return;
      }
      try {
        await __chatExtRegenerar(_0x347dec);
        __clasifCopiar(__chatExtUrl(_0x347dec.datos.chatExt));
        render();
      } catch (_0x8beed5) {
        _0x1afab2(_0x8beed5);
      }
    });
  }
  const __IA_MAX_TEXTO_DIA = 10;
  const __IA_MAX_RESUMEN_DIA = 10;
  const __IA_MAX_SEGMENTOS = 15;
  const __IA_MAX_CACHE_TEXTO = 200;
  const __GEMINI_LADO_MAX = 1600;
  function __iaUso() {
    const _0x20dc5d = __clasifStore();
    const _0xeeaff7 = new Date().toISOString().slice(0, 10);
    if (_0x20dc5d.ia.uso.f !== _0xeeaff7) {
      _0x20dc5d.ia.uso = {
        f: _0xeeaff7,
        texto: 0,
        resumen: 0
      };
    }
    return _0x20dc5d.ia.uso;
  }
  function __geminiReducirImagen(_0x3fee1d) {
    return new Promise(_0x546e2b => {
      const _0x1df919 = new Image();
      _0x1df919.onload = () => {
        const _0x9421fc = Math.min(1, __GEMINI_LADO_MAX / Math.max(_0x1df919.width, _0x1df919.height));
        const _0x720a20 = document.createElement("canvas");
        _0x720a20.width = Math.round(_0x1df919.width * _0x9421fc);
        _0x720a20.height = Math.round(_0x1df919.height * _0x9421fc);
        _0x720a20.getContext("2d").drawImage(_0x1df919, 0, 0, _0x720a20.width, _0x720a20.height);
        const _0x550bf1 = /^data:([^;]+);base64,(.*)$/s.exec(_0x720a20.toDataURL("image/jpeg", 0.8));
        _0x546e2b(_0x550bf1 ? {
          mime_type: _0x550bf1[1],
          data: _0x550bf1[2]
        } : null);
      };
      _0x1df919.onerror = () => _0x546e2b(null);
      _0x1df919.src = _0x3fee1d.url || "";
    });
  }
  async function __iaJson(_0x36a406) {
    const _0x1d529d = new AbortController();
    const _0x245087 = setTimeout(() => _0x1d529d.abort(), 30000);
    try {
      const _0x1e3dff = await __proxyFetch({
        prompt: _0x36a406,
        imagenes: []
      }, _0x1d529d.signal);
      return await __geminiParsearRespuesta(_0x1e3dff, true);
    } finally {
      clearTimeout(_0x245087);
    }
  }
  function __textoRef(_0x3c96b2, _0x3b471f) {
    const _0x2c3f02 = __clasifRefDirecta(_0x3c96b2);
    if (_0x2c3f02) {
      return _0x2c3f02;
    }
    const _0x3bfa43 = __clasifFichas(_0x3c96b2);
    if (!_0x3bfa43.length) {
      return null;
    }
    let _0xf4e18c = null;
    let _0x1434dc = 0;
    _0x3b471f.forEach(_0xf812f2 => {
      const _0x113a7a = __clasifSimilitud(_0x3bfa43, _0xf812f2.f);
      if (_0x113a7a > _0x1434dc) {
        _0x1434dc = _0x113a7a;
        _0xf4e18c = _0xf812f2.c;
      }
    });
    if (_0xf4e18c && _0x1434dc >= __REF_AUTO_SIM && __clasifNumerosCompatibles(_0x3c96b2, _0xf4e18c.code + " " + _0xf4e18c.desc)) {
      return _0xf4e18c;
    } else {
      return null;
    }
  }
  async function __textoIA(_0xb0f8fb) {
    const _0x7d94fa = __clasifStore();
    const _0x316cbf = __iaUso();
    const _0x6c849f = _0xb0f8fb.map(_0x166c9e => __clasifNormalizar(_0x166c9e).slice(0, 200));
    const _0x49140e = [];
    _0xb0f8fb.forEach((_0x122063, _0x528254) => {
      if (!_0x7d94fa.ia.txt[_0x6c849f[_0x528254]] && _0x49140e.length < __IA_MAX_SEGMENTOS) {
        _0x49140e.push(_0x528254);
      }
    });
    if (_0x49140e.length) {
      if (_0x316cbf.texto >= __IA_MAX_TEXTO_DIA) {
        return "Límite diario de usos de la IA alcanzado; las líneas complejas se han dejado sin dividir.";
      }
      _0x316cbf.texto++;
      __guardarClasif();
      const _0x12e787 = "Almacén industrial. Cada línea es un texto de pedido que puede contener varios artículos. Devuelve SOLO un array JSON con un elemento por línea, en el mismo orden: [[n,[\"artículo\",…]],…]. Separa cada artículo tal como está escrito, sin cambiar el texto ni quitar o añadir números; no inventes artículos; conserva medidas y números dentro del nombre.\n" + _0x49140e.map((_0x554895, _0x1fb11e) => _0x1fb11e + 1 + "|" + __iaCorto(_0xb0f8fb[_0x554895], 200)).join("\n");
      try {
        const _0x7bfb2a = await __iaJson(_0x12e787);
        _0x49140e.forEach((_0xad3ced, _0x421769) => {
          const _0x4296c8 = _0x7bfb2a.find(_0x21879a => Array.isArray(_0x21879a) && parseInt(_0x21879a[0], 10) === _0x421769 + 1);
          const _0x1a5ddb = _0x4296c8 && Array.isArray(_0x4296c8[1]) ? _0x4296c8[1].map(_0x1d93db => String(Array.isArray(_0x1d93db) ? _0x1d93db[0] : _0x1d93db || "").trim().slice(0, 120)).filter(Boolean) : [];
          _0x7d94fa.ia.txt[_0x6c849f[_0xad3ced]] = {
            r: _0x1a5ddb,
            ts: Date.now()
          };
        });
        const _0x1609e4 = Object.keys(_0x7d94fa.ia.txt);
        if (_0x1609e4.length > __IA_MAX_CACHE_TEXTO) {
          _0x1609e4.sort((_0x5d9c39, _0xdf2879) => _0x7d94fa.ia.txt[_0x5d9c39].ts - _0x7d94fa.ia.txt[_0xdf2879].ts).slice(0, _0x1609e4.length - __IA_MAX_CACHE_TEXTO).forEach(_0x12f0c4 => delete _0x7d94fa.ia.txt[_0x12f0c4]);
        }
        __guardarClasif();
      } catch (_0x5e7638) {
        return "La IA no ha respondido (" + __errorAmable(_0x5e7638) + "); las líneas complejas se han dejado sin dividir.";
      }
    }
    return "";
  }
  const __textoEstado = {
    texto: "",
    quien: "",
    lineas: null,
    aviso: ""
  };
  function __textoPanel() {
    const _0x518bf4 = document.getElementById("textoPanel");
    if (_0x518bf4) {
      _0x518bf4.remove();
    }
    const _0xfb7abe = __chatExtGrupo();
    const _0x3fd869 = document.getElementById("chatMensajeInput");
    const _0x388d91 = _0x3fd869 && _0x3fd869.closest(".ticket") || $(".chat-tabs-row");
    if (!_0xfb7abe || !_0xfb7abe.datos || _0x5592da !== "chat" || !_0x388d91) {
      return;
    }
    const _0x3f408d = __textoEstado.lineas;
    const _0x21c30f = !_0xfb7abe.datos.pendiente.requesterName;
    const _0xcb82f9 = __iaUso();
    const _0x4972d5 = document.createElement("div");
    _0x4972d5.className = "panel";
    _0x4972d5.id = "textoPanel";
    _0x4972d5.style.marginTop = "10px";
    let _0x1d52b7 = "<p class=\"panel-title\">Pegar una lista larga</p><p style=\"font-size:12px; color:var(--text-muted); margin:0 0 8px;\">Para listas de un correo o mensaje: un artículo por línea o separados por comas. Almacén asigna las cantidades. Solo las líneas con varios artículos mezclados usan la IA (usos de hoy: " + _0xcb82f9.texto + "/" + __IA_MAX_TEXTO_DIA + ").</p><textarea data-texto-entrada rows=\"4\" style=\"width:100%; font-size:13px;\" placeholder=\"Pegar o escribir la lista…\"></textarea>" + (_0x21c30f ? "<input type=\"text\" data-texto-quien placeholder=\"Quién pide el material\" maxlength=\"60\" style=\"margin-top:8px; width:100%;\">" : "") + "<button type=\"button\" class=\"cam-btn\" data-texto-interpretar style=\"width:100%; margin-top:8px;\">Interpretar lista</button>";
    if (__textoEstado.aviso) {
      _0x1d52b7 += "<p style=\"font-size:12px; color:var(--warning, #e5a03c); margin:8px 0 0;\">" + _0x1d1ab0(__textoEstado.aviso) + "</p>";
    }
    if (_0x3f408d && _0x3f408d.length) {
      _0x1d52b7 += "<div class=\"clasif-rap-grid\" style=\"margin-top:10px;\">" + _0x3f408d.map((_0x31ef69, _0x406bec) => {
        const _0x478947 = _0x31ef69.ref ? (estado.catalog || []).find(_0x3d7d52 => _0x3d7d52.id === _0x31ef69.ref) : null;
        return "<label class=\"clasif-rap-item\"><input type=\"checkbox\" data-texto-chk=\"" + _0x406bec + "\"" + (_0x31ef69.marcada ? " checked" : "") + "><span class=\"clasif-rap-txt\">" + _0x1d1ab0(_0x31ef69.desc) + "<small>" + (_0x478947 ? "→ " + _0x1d1ab0(_0x478947.code + " — " + (_0x478947.desc || "")) : "sin referencia (texto libre)") + (_0x31ef69.ia ? " · IA" : "") + "</small></span></label>";
      }).join("") + "</div><button type=\"button\" class=\"btn primary\" data-texto-anadir style=\"width:100%; margin-top:10px;\">Añadir a la solicitud</button>";
    } else if (_0x3f408d) {
      _0x1d52b7 += "<p style=\"font-size:12.5px; color:var(--text-faint); margin:10px 0 0;\">No se ha reconocido ninguna línea.</p>";
    }
    _0x4972d5.innerHTML = _0x1d52b7;
    _0x388d91.after(_0x4972d5);
    const _0x118739 = _0x4972d5.querySelector("[data-texto-entrada]");
    _0x118739.value = __textoEstado.texto;
    _0x118739.addEventListener("input", () => {
      __textoEstado.texto = _0x118739.value;
    });
    const _0x5c509c = _0x4972d5.querySelector("[data-texto-quien]");
    if (_0x5c509c) {
      _0x5c509c.value = __textoEstado.quien;
      _0x5c509c.addEventListener("input", () => {
        __textoEstado.quien = _0x5c509c.value;
      });
    }
    const _0xf5cf7d = _0x4972d5.querySelector("[data-texto-interpretar]");
    _0xf5cf7d.addEventListener("click", async () => {
      if (!__textoEstado.texto.trim()) {
        return;
      }
      _0xf5cf7d.disabled = true;
      _0xf5cf7d.textContent = "Interpretando…";
      await __textoInterpretar();
    });
    _0x4972d5.querySelectorAll("[data-texto-chk]").forEach(_0x4c3497 => _0x4c3497.addEventListener("change", () => {
      _0x3f408d[_0x4c3497.getAttribute("data-texto-chk")].marcada = _0x4c3497.checked;
    }));
    const _0x45fb7b = _0x4972d5.querySelector("[data-texto-anadir]");
    if (_0x45fb7b) {
      _0x45fb7b.addEventListener("click", () => {
        if (_0x21c30f && !__textoEstado.quien.trim()) {
          _0x279f78("Indicar quién pide el material.");
          return;
        }
        __textoAplicar(_0xfb7abe);
      });
    }
  }
  function __analisisLocal() {
    const _0x2402be = estado;
    const _0x55b63c = Date.now();
    const _0x3f2907 = _0x55b63c - 2592000000;
    const _0xabcf7 = _0x55b63c - 7776000000;
    const _0x3e7508 = new Map();
    const _0x1b1b59 = new Map();
    const _0x1e7b4f = new Map();
    (_0x2402be.movements || []).forEach(_0x4d29c2 => {
      if ((_0x4d29c2.tsMs || 0) > (_0x1e7b4f.get(_0x4d29c2.code) || 0)) {
        _0x1e7b4f.set(_0x4d29c2.code, _0x4d29c2.tsMs || 0);
      }
      if (_0x4d29c2.type !== "salida" || !(_0x4d29c2.tsMs >= _0x3f2907)) {
        return;
      }
      _0x3e7508.set(_0x4d29c2.code, (_0x3e7508.get(_0x4d29c2.code) || 0) + _0x4d29c2.qty);
      if (!_0x1b1b59.has(_0x4d29c2.code)) {
        _0x1b1b59.set(_0x4d29c2.code, []);
      }
      _0x1b1b59.get(_0x4d29c2.code).push(_0x4d29c2.qty);
    });
    const _0xab94d = _0x222f12 => _0x222f12.code + " " + __iaCorto(_0x222f12.desc, 30);
    const _0x19cc34 = new Map((_0x2402be.catalog || []).map(_0x19b7a2 => [_0x19b7a2.code, _0x19b7a2]));
    const _0x581ec = [..._0x3e7508.entries()].sort((_0x51fc3e, _0x5192cc) => _0x5192cc[1] - _0x51fc3e[1]).slice(0, 5).map(_0x2df5f7 => (_0x19cc34.get(_0x2df5f7[0]) ? _0xab94d(_0x19cc34.get(_0x2df5f7[0])) : _0x2df5f7[0]) + ": " + _0x2df5f7[1]);
    const _0x1a252a = (_0x2402be.catalog || []).filter(_0x444079 => _0x444079.qty > 0 && _0x3e7508.get(_0x444079.code) > 0).map(_0x3570c5 => ({
      c: _0x3570c5,
      d: _0x3570c5.qty / (_0x3e7508.get(_0x3570c5.code) / 30)
    })).filter(_0xbb318c => _0xbb318c.d <= 10).sort((_0x440dca, _0x453d61) => _0x440dca.d - _0x453d61.d).slice(0, 5).map(_0x2f9a03 => _0xab94d(_0x2f9a03.c) + ": ~" + Math.max(1, Math.round(_0x2f9a03.d)) + " días");
    const _0x3f2070 = _0x41ba69().sort((_0x3a403d, _0x251812) => _0x3a403d.qty - __clasifMinimo(_0x3a403d) - (_0x251812.qty - __clasifMinimo(_0x251812)));
    const _0x56a571 = [];
    _0x1b1b59.forEach((_0xc8d84b, _0x3cb264) => {
      if (_0xc8d84b.length < 4) {
        return;
      }
      const _0x575ba4 = _0xc8d84b.slice().sort((_0x323882, _0x530c57) => _0x323882 - _0x530c57);
      const _0x579e1c = _0x575ba4[Math.floor(_0x575ba4.length / 2)];
      const _0x38e2af = _0x575ba4[_0x575ba4.length - 1];
      if (_0x38e2af > Math.max(10, _0x579e1c * 3) && _0x19cc34.get(_0x3cb264)) {
        _0x56a571.push(_0xab94d(_0x19cc34.get(_0x3cb264)) + ": salida de " + _0x38e2af + " (habitual " + _0x579e1c + ")");
      }
    });
    const _0x357a74 = (_0x2402be.catalog || []).filter(_0xcb88fe => _0xcb88fe.qty > 0 && (_0x1e7b4f.get(_0xcb88fe.code) || 0) < _0xabcf7 && (_0x2402be.movements || []).length).length;
    return {
      top: _0x581ec,
      agotan: _0x1a252a,
      bajo: _0x3f2070.slice(0, 5).map(_0x2c8e32 => _0xab94d(_0x2c8e32) + ": " + _0x2c8e32.qty + " (mín. " + __clasifMinimo(_0x2c8e32) + ")"),
      nBajo: _0x3f2070.length,
      anomalias: _0x56a571.slice(0, 3),
      latentes: _0x357a74
    };
  }
  function __analisisFirma(_0x256339) {
    let _0x5cb3f4 = 2166136261;
    for (let _0x567dbd = 0; _0x567dbd < _0x256339.length; _0x567dbd++) {
      _0x5cb3f4 = Math.imul(_0x5cb3f4 ^ _0x256339.charCodeAt(_0x567dbd), 16777619);
    }
    return String(_0x5cb3f4 >>> 0);
  }
  function __analisisPanel() {
    const _0x3996ad = document.getElementById("analisisPanel");
    if (_0x3996ad) {
      _0x3996ad.remove();
    }
    if (estado.mode !== "resumen" || _0x2df77d() !== "almacen") {
      return;
    }
    const _0x14bbcb = [...document.querySelectorAll(".panel-title,.eyebrow")].find(_0x40dae4 => _0x40dae4.textContent.trim() === "Almacén");
    const _0x14e216 = _0x14bbcb && (_0x14bbcb.closest(".panel") || _0x14bbcb.parentElement);
    if (!_0x14e216) {
      return;
    }
    const _0x7d28e0 = __analisisLocal();
    const _0x1e39ac = __analisisTexto(_0x7d28e0);
    const _0x1e6539 = __analisisFirma(_0x1e39ac);
    const _0x546a96 = __clasifStore();
    const _0x670645 = _0x546a96.ia.resumen && _0x546a96.ia.resumen.h === _0x1e6539 ? _0x546a96.ia.resumen.items : null;
    const _0x19a3d0 = __iaUso();
    const _0x145208 = (_0xfb71c2, _0x4f0139) => "<p style=\"margin:0 0 6px; font-size:12.5px;\"><b>" + _0xfb71c2 + ":</b> " + _0x1d1ab0(_0x4f0139.length ? _0x4f0139.join("; ") : "—") + "</p>";
    const _0x5765ad = document.createElement("div");
    _0x5765ad.className = "panel";
    _0x5765ad.id = "analisisPanel";
    _0x5765ad.style.marginBottom = "14px";
    _0x5765ad.innerHTML = "<p class=\"panel-title\">Análisis de actividad (30 días)</p>" + _0x145208("Más consumo", _0x7d28e0.top) + _0x145208("Se agotan en ≤10 días", _0x7d28e0.agotan) + _0x145208("Stock bajo (" + _0x7d28e0.nBajo + ")", _0x7d28e0.bajo) + _0x145208("Salidas anómalas", _0x7d28e0.anomalias) + "<p style=\"margin:0 0 8px; font-size:12.5px;\"><b>Con stock y sin movimiento en 90 días:</b> " + _0x7d28e0.latentes + "</p>" + (_0x670645 ? "<ul id=\"analisisIa\" style=\"margin:8px 0; padding-left:18px; font-size:12.5px;\">" + _0x670645.map(_0xb3af50 => "<li>" + _0x1d1ab0(_0xb3af50) + "</li>").join("") + "</ul>" : "") + "<button type=\"button\" class=\"cam-btn\" id=\"analisisIaBtn\" style=\"width:100%;\"" + (_0x670645 || _0x19a3d0.resumen >= __IA_MAX_RESUMEN_DIA ? " disabled" : "") + ">" + (_0x670645 ? "Recomendaciones de la IA (ya generadas con estos datos)" : "Pedir recomendaciones a la IA (usos de hoy: " + _0x19a3d0.resumen + "/" + __IA_MAX_RESUMEN_DIA + ")") + "</button>";
    // Primero las tarjetas de «lo más urgente» (lo que promete el texto de arriba); el análisis y la reposición, después
    _0x14e216.parentElement.appendChild(_0x5765ad);
    $("#analisisIaBtn").addEventListener("click", async () => {
      const _0x314f26 = $("#analisisIaBtn");
      _0x314f26.disabled = true;
      _0x314f26.textContent = "Consultando…";
      try {
        const _0xd4a881 = await __iaJson("Eres analista de un almacén industrial. Con estos datos escribe como máximo 5 recomendaciones concretas, breves (≤25 palabras cada una) y en español, sin repetir los datos tal cual. Devuelve SOLO un array JSON de cadenas.\n" + _0x1e39ac);
        const _0x5794e4 = _0xd4a881.map(_0x47bd62 => String(_0x47bd62).trim().slice(0, 220)).filter(Boolean).slice(0, 5);
        if (!_0x5794e4.length) {
          throw new Error("respuesta vacía");
        }
        __iaUso().resumen++;
        _0x546a96.ia.resumen = {
          h: _0x1e6539,
          items: _0x5794e4
        };
        __guardarClasif();
      } catch (_0x4a4aa5) {
        _0x279f78("La IA no ha respondido: " + __errorAmable(_0x4a4aa5) + ".");
      }
      render();
    });
  }
  function __reposicionTexto(_0xb6de0a) {
    return "Reposición de material (" + new Date().toLocaleDateString("es-ES") + "):\n" + _0xb6de0a.map(_0x725a82 => "- " + _0x725a82.code + " · " + _0x725a82.desc + ": pedir " + _0x725a82.cant + " (stock " + _0x725a82.qty + ", mín. " + _0x725a82.min + ")").join("\n");
  }
  function __reposicionPanel() {
    const _0x1e68ca = document.getElementById("reposicionPanel");
    if (_0x1e68ca) {
      _0x1e68ca.remove();
    }
    if (estado.mode !== "resumen" || _0x2df77d() !== "almacen") {
      return;
    }
    const _0x1498d2 = __reposicionLista().sort((_0xda2be0, _0x56e824) => _0xda2be0.qty - __clasifMinimo(_0xda2be0) - (_0x56e824.qty - __clasifMinimo(_0x56e824))).slice(0, 40);
    const _0x203b41 = document.getElementById("analisisPanel");
    if (!_0x1498d2.length || !_0x203b41) {
      return;
    }
    const _0x51542b = _0x1d1ab0;
    const _0x8a1de = document.createElement("div");
    _0x8a1de.className = "panel";
    _0x8a1de.id = "reposicionPanel";
    _0x8a1de.style.marginBottom = "14px";
    _0x8a1de.innerHTML = "<p class=\"panel-title\">Reposición</p><p style=\"margin:0 0 8px; font-size:12px; color:var(--text-faint);\">Materiales por debajo de su mínimo. La cantidad propuesta lleva el stock al doble del mínimo; se puede cambiar antes de copiar o enviar.</p>" + _0x1498d2.map(_0x44ddaa => {
      const _0x111e16 = __clasifMinimo(_0x44ddaa);
      return "<label class=\"clasif-rap-item\" style=\"display:flex; align-items:center; gap:8px; margin-bottom:6px;\"><input type=\"checkbox\" aria-label=\"Incluir en la reposición\" data-repo-sel=\"" + _0x51542b(_0x44ddaa.id) + "\" checked><span class=\"clasif-rap-txt\" style=\"flex:1; min-width:0;\">" + _0x51542b(_0x44ddaa.code) + " · " + _0x51542b(__iaCorto(_0x44ddaa.desc || "", 40)) + "<small>stock " + _0x51542b(_0x44ddaa.qty) + " · mín. " + _0x51542b(_0x111e16) + "</small></span><input type=\"number\" min=\"1\" step=\"1\" aria-label=\"Cantidad a reponer\" data-repo-cant value=\"" + Math.max(1, _0x111e16 * 2 - _0x44ddaa.qty) + "\" style=\"width:72px;\"></label>";
    }).join("") + "<div style=\"display:flex; gap:8px; margin-top:8px;\"><button type=\"button\" class=\"cam-btn\" data-repo-copiar style=\"flex:1;\">Copiar lista</button><button type=\"button\" class=\"cam-btn\" data-repo-correo style=\"flex:1;\">Enviar por correo</button></div>";
    _0x203b41.after(_0x8a1de);
    __reposicionAjustar();
    const _0x451d11 = () => [..._0x8a1de.querySelectorAll("[data-repo-sel]")].filter(_0x36f3b0 => _0x36f3b0.checked).map(_0x343c4b => {
      const _0x30b80d = (estado.catalog || []).find(_0x2742b9 => _0x2742b9.id === _0x343c4b.getAttribute("data-repo-sel"));
      const _0x449b00 = parseInt(_0x343c4b.closest("label").querySelector("[data-repo-cant]").value, 10);
      if (_0x30b80d && _0x449b00 > 0) {
        return {
          code: _0x30b80d.code,
          desc: _0x30b80d.desc || "",
          qty: _0x30b80d.qty,
          min: __clasifMinimo(_0x30b80d),
          cant: _0x449b00
        };
      } else {
        return null;
      }
    }).filter(Boolean);
    const _0x151278 = _0x1f1aee => () => {
      const _0x35ec2f = _0x451d11();
      if (!_0x35ec2f.length) {
        _0x279f78("Marca al menos un material con cantidad.");
        return;
      }
      _0x1f1aee(__reposicionTexto(_0x35ec2f));
    };
    _0x8a1de.querySelector("[data-repo-copiar]").addEventListener("click", _0x151278(__clasifCopiar));
    _0x8a1de.querySelector("[data-repo-correo]").addEventListener("click", _0x151278(_0x425403 => __clasifAbrirCorreo(_0x425403, "Reposición de material")));
  }
  const __AUTO_ENVIO_MS = 15000;
  let __autoEnvio = null;
  let __avisoValidar = "";
  async function __chatEnviar() {
    const _0x3edc96 = _0x1ea037();
    if (!_0x3edc96) {
      return;
    }
    if (!(await _0x328b69(_0x3edc96))) {
      return;
    }
    const _0xee7bb0 = document.getElementById("chatMensajeInput");
    const _0x54fc35 = __textoSegmentos(_0xee7bb0 ? _0xee7bb0.value : "");
    if (!_0x54fc35.length) {
      _0x279f78("Escribe qué hace falta antes de enviar.");
      return;
    }
    const _0x388bb0 = await __textoDividir(_0x54fc35);
    const _0x578c59 = _0x388bb0.lineas;
    if (_0x388bb0.aviso) {
      _0x279f78(_0x388bb0.aviso);
    }
    const _0x45d5ea = !!_0x1b4d13.reservaActiva;
    _0x578c59.forEach(_0x436112 => {
      const _0x577c8e = nuevoId();
      _0x3edc96.pendiente.items.push({
        id: _0x577c8e,
        itemId: null,
        code: "",
        desc: "",
        referencia: "",
        textoLibre: _0x436112.desc,
        qty: _0x436112.qty || 1,
        guardado: true,
        fechaGuardado: new Date().toLocaleString("es-ES"),
        pedido: 0,
        reserva: _0x45d5ea ? 1 : 0,
        destino: ""
      });
      anadirMensajeChat(_0x3edc96.chat, "Pedido: " + _0x436112.desc + " ×" + (_0x436112.qty || 1) + " (sin referencia todavía)");
      _0x3edc96.chat[_0x3edc96.chat.length - 1].pendienteId = _0x577c8e;
    });
    __clasifLimpiarChat();
    _0x29f0a4();
    _0x1b4d13.reservaActiva = false;
    _0x1e1e26();
    __autoEnvioProgramar();
  }
  function __autoEnvioBarra() {
    let _0x35cc60 = document.getElementById("autoEnvioBarra");
    if (!_0x35cc60) {
      _0x35cc60 = document.createElement("div");
      _0x35cc60.id = "autoEnvioBarra";
      _0x35cc60.innerHTML = "<span data-auto-txt></span><button type=\"button\" class=\"cam-btn\" data-auto-ya>Enviar ya</button><button type=\"button\" class=\"cam-btn\" data-auto-cancelar>Cancelar</button>";
      _0x35cc60.querySelector("[data-auto-ya]").addEventListener("click", () => __autoEnvioEjecutar());
      _0x35cc60.querySelector("[data-auto-cancelar]").addEventListener("click", () => __autoEnvioCancelar());
      document.body.appendChild(_0x35cc60);
    }
    return _0x35cc60;
  }
  function __autoEnvioCancelar() {
    if (__autoEnvio) {
      clearInterval(__autoEnvio.reloj);
      __autoEnvio = null;
    }
    const _0x2a2e0d = document.getElementById("autoEnvioBarra");
    if (_0x2a2e0d) {
      _0x2a2e0d.remove();
    }
  }
  function __autoEnvioProgramar() {
    try {
      if (_0x2df77d() !== "almacen") {
        return;
      }
      const _0x14ef3c = estado.mode;
      const _0x4f9494 = estado.current[_0x14ef3c];
      if (_0x14ef3c !== "montaje" && _0x14ef3c !== "proyecto") {
        return;
      }
      const _0x47f4df = __clasifStore();
      if (_0x47f4df.autoEnvio === false || !_0x4f9494) {
        return;
      }
      const _0xee0917 = __autoEnvioLineas(_0x14ef3c, _0x4f9494).length;
      if (!_0xee0917) {
        __autoEnvioCancelar();
        const _0x5549b0 = estado.groupData[_0x14ef3c + "::" + _0x4f9494];
        const _0x583b14 = (_0x5549b0 && _0x5549b0.pendiente && _0x5549b0.pendiente.items || []).filter(_0x1df040 => {
          if (_0x1df040.extPeticion) {
            return false;
          }
          const _0x158b74 = __clasifLinea(_0x1df040);
          return _0x158b74.tipo === "externo" && !_0x158b74.ok;
        }).length;
        const _0x41f900 = _0x14ef3c + "::" + _0x4f9494 + "::" + _0x583b14;
        if (_0x583b14 && _0x41f900 !== __avisoValidar) {
          __avisoValidar = _0x41f900;
          _0x279f78(_0x583b14 + " línea" + (_0x583b14 === 1 ? "" : "s") + " externa" + (_0x583b14 === 1 ? "" : "s") + " sin validar: el envío automático solo incluye las validadas. Valídalas en Hoja de pedido.");
        }
        return;
      }
      if (!(_0x47f4df.email || "").trim()) {
        _0x279f78("Para el envío automático, indicar el correo de destino en Hoja de pedido → Listado externo.");
        return;
      }
      __autoEnvioCancelar();
      __autoEnvio = {
        modo: _0x14ef3c,
        nombre: _0x4f9494,
        fin: Date.now() + __AUTO_ENVIO_MS,
        reloj: null
      };
      const _0x556be1 = () => {
        if (!__autoEnvio) {
          return;
        }
        const _0x6e4558 = Math.max(0, Math.ceil((__autoEnvio.fin - Date.now()) / 1000));
        __autoEnvioBarra().querySelector("[data-auto-txt]").textContent = "Petición externa de «" + __autoEnvio.nombre + "» (" + __autoEnvioLineas(__autoEnvio.modo, __autoEnvio.nombre).length + " líneas): se envía en " + _0x6e4558 + " s";
        if (Date.now() >= __autoEnvio.fin) {
          __autoEnvioEjecutar();
        }
      };
      __autoEnvio.reloj = setInterval(_0x556be1, 1000);
      _0x556be1();
    } catch (_0xf35f20) {}
  }
  function __correoCampo() {
    const _0x51cb96 = __clasifStore();
    const _0x2bf723 = document.createElement("div");
    _0x2bf723.innerHTML = "<input type=\"text\" id=\"clasifEmail\" placeholder=\"Correo de destino (se recuerda)\" style=\"margin-top:8px;\"><label style=\"display:flex; gap:8px; align-items:center; font-size:12px; color:var(--text-muted); margin-top:8px;\"><input type=\"checkbox\" data-clasif-auto" + (_0x51cb96.autoEnvio === false ? "" : " checked") + "> Enviar solo, " + __AUTO_ENVIO_MS / 1000 + " s después de que Almacén termine de escribir el listado en el chat</label>";
    const _0x520052 = _0x2bf723.querySelector("#clasifEmail");
    _0x520052.value = _0x51cb96.email || "";
    _0x520052.addEventListener("change", () => {
      __clasifStore().email = _0x520052.value.trim();
      __guardarClasif();
    });
    _0x2bf723.querySelector("[data-clasif-auto]").addEventListener("change", _0x25edba => {
      __clasifStore().autoEnvio = _0x25edba.target.checked;
      if (!_0x25edba.target.checked) {
        __autoEnvioCancelar();
      }
      __guardarClasif();
    });
    return {
      nodo: _0x2bf723,
      entrada: _0x520052
    };
  }
  const __GUIAS = {
    "chat|taller": "Escribe lo que hace falta y pulsa «Enviar». Almacén recibe el aviso y pone las cantidades.",
    "chat|almacen": "Aquí llegan los pedidos del taller. Se revisan en la pestaña «Hoja de pedido».",
    "hoja|almacen": "Asigna la referencia a las líneas sin ella y confirma «Interno o externo» en «Revisar pedido». El externo se envía solo.",
    "hoja|taller": "Revisa las líneas de tu pedido y pulsa «Guardar y avisar a almacén»."
  };
  let __escanerAbierto = null;
  function __guiaTrabajo() {
    const _0xa6df73 = document.getElementById("guiaTrabajo");
    if (_0xa6df73) {
      _0xa6df73.remove();
    }
    const _0xbfea13 = document.querySelector(".chat-tabs-row");
    const _0x3e9497 = __GUIAS[_0x5592da + "|" + _0x2df77d()];
    if (!_0xbfea13 || !_0x3e9497 || estado.mode !== "montaje" && estado.mode !== "proyecto") {
      return;
    }
    const _0x1983e9 = document.createElement("p");
    _0x1983e9.id = "guiaTrabajo";
    _0x1983e9.textContent = _0x3e9497;
    _0xbfea13.after(_0x1983e9);
  }
  function __escanerPlegable() {
    const _0x143348 = document.getElementById("escanerBarra");
    if (_0x143348) {
      _0x143348.remove();
    }
    const _0x5bb334 = document.getElementById("scannerZone");
    if (!_0x5bb334) {
      return;
    }
    _0x5bb334.style.display = "";
    if (estado.mode !== "montaje" && estado.mode !== "proyecto") {
      return;
    }
    if (__escanerAbierto === null) {
      let _0x18d475 = null;
      try {
        _0x18d475 = localStorage.getItem("tecnomat_escaner");
      } catch (_0x537d35) {}
      __escanerAbierto = _0x18d475 === null ? _0x2df77d() === "almacen" : _0x18d475 === "1";
    }
    const _0x3bfa82 = document.createElement("button");
    _0x3bfa82.type = "button";
    _0x3bfa82.id = "escanerBarra";
    _0x3bfa82.className = "cam-btn";
    const _0x308924 = () => {
      _0x3bfa82.innerHTML = "<span>Escanear o introducir un código</span><span>" + (__escanerAbierto ? "▾" : "▸") + "</span>";
      _0x5bb334.style.display = __escanerAbierto ? "" : "none";
    };
    _0x3bfa82.addEventListener("click", () => {
      __escanerAbierto = !__escanerAbierto;
      try {
        localStorage.setItem("tecnomat_escaner", __escanerAbierto ? "1" : "0");
      } catch (_0x49d40f) {}
      _0x308924();
    });
    _0x308924();
    _0x5bb334.parentNode.insertBefore(_0x3bfa82, _0x5bb334);
  }
  function __clasifPostRender() {
    __pedidoFechas();
    __planoSincronizar();
    __fusionarAvisos();
    __resumenPorRevisar();
    __hojaListas();
    __servidoListas();
    __clasifCorreoGlobal();
    const _0x56386c = document.getElementById("chatReservaToggleBtn");
    if (_0x56386c) {
      _0x56386c.title = "Marcar la petición como reserva de material";
    }
    __chatExtPanel();
    __textoPanel();
    __analisisPanel();
    __reposicionPanel();
    __busquedaPanel();
    __herramientasPanel();
    __chatExtSincronizar();
    __editarIniciar();
    __pushPanel();
    __respaldoSincronizar();
    __clasifRefrescar();
    __clasifPanelAlmacen();
    __clasifPestanaPM();
    __clasifPlegables();
    __clasifPestanaVisible();
    __guiaTrabajo();
    __escanerPlegable();
  }
  let __clasifUltimoRefresco = 0;
  function __clasifRefrescar() {
    try {
      if (_0x2df77d() === "almacen") {
        return;
      }
      if (Date.now() - __clasifUltimoRefresco < 30000) {
        return;
      }
      __clasifUltimoRefresco = Date.now();
      Promise.resolve(_0x31ceb4("clasificacion")).then(_0x5638df => {
        if (!_0x5638df) {
          return;
        }
        __clasifMigrar(_0x5638df);
        if (JSON.stringify(_0x5638df) === JSON.stringify(estado.clasificacion)) {
          return;
        }
        estado.clasificacion = _0x5638df;
        render();
      }).catch(() => {});
    } catch (_0x2dbc76) {}
  }
  let __clasifVista = "interno";
  let __clasifVistaClave = "";
  let __clasifPend = null;
  function __clasifVaciar() {
    const _0x1cffa5 = __clasifPend;
    __clasifPend = null;
    if (!_0x1cffa5) {
      return;
    }
    __guardarClasif();
    Object.keys(_0x1cffa5).forEach(_0x1972a4 => guardarGrupo(_0x1cffa5[_0x1972a4][0], _0x1cffa5[_0x1972a4][1]));
  }
  function __clasifGuardarPronto() {
    const _0x4b1b0b = estado.mode;
    const _0x57a30e = estado.current[_0x4b1b0b];
    if (!__clasifPend) {
      __clasifPend = {};
      setTimeout(__clasifVaciar, 300);
    }
    if (_0x57a30e) {
      __clasifPend[_0x4b1b0b + "::" + _0x57a30e] = [_0x4b1b0b, _0x57a30e];
    }
  }
  window.addEventListener("pagehide", __clasifVaciar);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      __clasifVaciar();
    }
  });
  let __clasifRapSel = {};
  let __clasifRapFiltro = "";
  let __pmActivo = false;
  let __clasifRapClave = "";
  let __clasifCtxUltimo = "";
  function __clasifContexto() {
    return estado.mode + "|" + (estado.current[estado.mode] || "") + "|" + _0x5592da;
  }
  function __clasifLimpiarChat() {
    const _0x508bfe = document.getElementById("chatMensajeInput");
    if (_0x508bfe) {
      _0x508bfe.value = "";
    }
  }
  function __clasifEnOrden(_0x49944a, _0x2c0fae) {
    if ((_0x49944a.pendiente.items || []).some(_0x23c8cb => _0x23c8cb.itemId === _0x2c0fae.id || _0x23c8cb.code && _0x23c8cb.code === _0x2c0fae.code)) {
      return "pedido";
    }
    if ((_0x49944a.servido || []).some(_0x5ae59f => _0x5ae59f.code === _0x2c0fae.code)) {
      return "servido";
    }
    return null;
  }
  function __clasifPestanaPM() {
    try {
      if (_0x2df77d() !== "almacen") {
        __pmActivo = false;
        ["clasifPmBtn", "clasifRapido"].forEach(_0x4b7c1e => {
          const _0x2c9d3a = document.getElementById(_0x4b7c1e);
          if (_0x2c9d3a) {
            _0x2c9d3a.remove();
          }
        });
        return;
      }
      document.querySelectorAll("#clasifRapido,#clasifPmBtn").forEach(_0x19a816 => _0x19a816.remove());
      if (_0x5592da !== "chat") {
        __pmActivo = false;
      }
      const _0x8d6a0f = estado.mode + "|" + (estado.current[estado.mode] || "");
      if (_0x8d6a0f !== __clasifRapClave) {
        __pmActivo = false;
      }
      if (!__pmActivo) {
        __clasifRapSel = {};
        __clasifRapFiltro = "";
        __clasifRapGestion = false;
      }
      __clasifRapClave = _0x8d6a0f;
      if (estado.mode !== "montaje" && estado.mode !== "proyecto") {
        return;
      }
      const _0x50e29e = document.querySelector(".chat-tabs-row");
      const _0x22c995 = _0x50e29e && _0x50e29e.querySelector("[data-view=\"chat\"]");
      if (!_0x22c995) {
        return;
      }
      const _0x554ff0 = [..._0x50e29e.querySelectorAll("[data-view]")];
      const _0x3db0fb = (_0x554ff0.find(_0xe61856 => (_0xe61856.getAttribute("style") || "").indexOf("var(--accent)") < 0) || _0x22c995).getAttribute("style") || "";
      const _0x43e1be = (_0x554ff0.find(_0x488fca => (_0x488fca.getAttribute("style") || "").indexOf("var(--accent)") >= 0) || _0x22c995).getAttribute("style") || "";
      const _0x46f1a4 = document.createElement("button");
      _0x46f1a4.id = "clasifPmBtn";
      _0x46f1a4.className = _0x22c995.className;
      _0x46f1a4.type = "button";
      _0x46f1a4.textContent = "Pequeño material";
      _0x46f1a4.setAttribute("style", __pmActivo ? _0x43e1be : _0x3db0fb);
      _0x22c995.parentNode.insertBefore(_0x46f1a4, _0x22c995.nextSibling);
      if (__pmActivo) {
        _0x22c995.setAttribute("style", _0x3db0fb);
      }
      _0x46f1a4.addEventListener("click", () => {
        __pmActivo = true;
        _0x5592da = "chat";
        render();
      });
      _0x22c995.addEventListener("click", () => {
        if (__pmActivo) {
          __pmActivo = false;
          render();
        }
      }, true);
      if (__pmActivo) {
        __clasifPequenoRapido();
      }
    } catch (_0x368b84) {}
  }
  function __clasifPQEnOrden(_0x30583a, _0x33367a, _0x314cd6) {
    if (_0x314cd6) {
      return __clasifEnOrden(_0x30583a, _0x314cd6);
    }
    const _0x315fdd = _0x33367a.key;
    if ((_0x30583a.pendiente.items || []).some(_0x1d0e6c => !_0x1d0e6c.code && __clasifClavePQ("", _0x1d0e6c.textoLibre || _0x1d0e6c.textoOrig || _0x1d0e6c.desc) === _0x315fdd)) {
      return "pedido";
    } else {
      return null;
    }
  }
  let __clasifRapGestion = false;
  function __clasifPequenoRapido() {
    try {
      const _0xbc1b5e = document.getElementById("chatMensajeInput");
      const _0x3f47a6 = _0xbc1b5e && _0xbc1b5e.closest(".ticket");
      if (!_0x3f47a6) {
        return;
      }
      const _0x30ac7d = _0x1ea037();
      if (!_0x30ac7d || !_0x30ac7d.pendiente) {
        return;
      }
      _0x3f47a6.style.display = "none";
      const _0x11a83f = _0x1d1ab0;
      const _0x1c6205 = _0x2df77d() === "almacen";
      const _0x513312 = __clasifStore().pq.map(_0x35855f => ({
        p: _0x35855f,
        cat: _0x35855f.code ? (estado.catalog || []).find(_0x1e2d23 => String(_0x1e2d23.code).toLowerCase() === String(_0x35855f.code).toLowerCase()) || null : null
      }));
      const _0x95ed45 = document.createElement("div");
      _0x95ed45.id = "clasifRapido";
      _0x95ed45.className = "panel";
      let _0x38f744 = "<p class=\"panel-title\">Pequeño material</p>";
      if (!_0x513312.length) {
        _0x38f744 += "<p style=\"font-size:12.5px; color:var(--text-faint); margin:0 0 8px;\">Todavía no hay material en la lista de pequeño material." + (_0x1c6205 ? " Se crea al marcar una línea como Pequeño material o con el campo de abajo." : " Almacén la irá completando.") + "</p>";
      } else {
        _0x38f744 += "<p style=\"font-size:12px; color:var(--text-muted); margin:0 0 8px;\">Lista común. Toca lo que necesitas y pulsa añadir: entra solo en esta orden, sin escribir. Almacén indica la cantidad al entregar.</p>";
        if (_0x513312.length > 8) {
          _0x38f744 += "<input type=\"text\" data-rap-filtro placeholder=\"Filtrar…\" style=\"margin-bottom:8px;\">";
        }
        _0x38f744 += "<div class=\"clasif-rap-grid\" data-rap-lista></div><button type=\"button\" class=\"btn primary\" data-rap-anadir style=\"width:100%; margin-top:10px;\"></button>";
      }
      if (_0x1c6205) {
        _0x38f744 += "<button type=\"button\" class=\"cam-btn\" data-rap-gestion style=\"width:100%; margin-top:10px;\">" + (__clasifRapGestion ? "Ocultar la gestión de la lista" : "Gestionar la lista (solo Almacén)") + "</button><div data-rap-gestion-caja></div>";
      }
      _0x95ed45.innerHTML = _0x38f744;
      const _0x59cb34 = _0x95ed45.querySelector("[data-rap-lista]");
      const _0x50c6d4 = _0x95ed45.querySelector("[data-rap-anadir]");
      const _0x573577 = () => {
        const _0x32e992 = Object.keys(__clasifRapSel).length;
        _0x50c6d4.textContent = _0x32e992 ? "Añadir " + _0x32e992 + " seleccionado" + (_0x32e992 === 1 ? "" : "s") + " al pedido" : "Toca lo que necesitas";
        _0x50c6d4.disabled = !_0x32e992;
      };
      const _0x293990 = () => {
        const _0x56ec95 = __clasifNormalizar(__clasifRapFiltro);
        _0x59cb34.innerHTML = "";
        _0x513312.filter(_0x57924f => !_0x56ec95 || __clasifNormalizar(_0x57924f.p.code + " " + _0x57924f.p.desc).indexOf(_0x56ec95) >= 0).forEach(_0x19d233 => {
          const _0x13aa0a = _0x19d233.p;
          const _0x56e408 = __clasifPQEnOrden(_0x30ac7d, _0x13aa0a, _0x19d233.cat);
          const _0x2eefa6 = _0x13aa0a.code ? "<strong>" + _0x11a83f(_0x13aa0a.code) + "</strong><small>" + _0x11a83f(_0x13aa0a.desc || "") + "</small>" : "<strong>" + _0x11a83f(_0x13aa0a.desc || "") + "</strong>";
          if (_0x56e408) {
            delete __clasifRapSel[_0x13aa0a.id];
            const _0x362a0e = document.createElement("div");
            _0x362a0e.className = "clasif-rap-item clasif-rap-ya";
            _0x362a0e.innerHTML = "<span class=\"clasif-rap-mark\"></span><span class=\"clasif-rap-txt\">" + _0x2eefa6 + "</span><span class=\"clasif-tag\">" + (_0x56e408 === "servido" ? "Ya servido" : "En el pedido") + "</span>";
            _0x59cb34.appendChild(_0x362a0e);
            return;
          }
          const _0x291be8 = document.createElement("button");
          _0x291be8.type = "button";
          _0x291be8.className = "clasif-rap-item" + (__clasifRapSel[_0x13aa0a.id] ? " sel" : "");
          _0x291be8.setAttribute("aria-pressed", __clasifRapSel[_0x13aa0a.id] ? "true" : "false");
          _0x291be8.innerHTML = "<span class=\"clasif-rap-mark\"></span><span class=\"clasif-rap-txt\">" + _0x2eefa6 + "</span>";
          _0x291be8.addEventListener("click", () => {
            const _0x1a0d97 = !__clasifRapSel[_0x13aa0a.id];
            if (_0x1a0d97) {
              __clasifRapSel[_0x13aa0a.id] = 1;
            } else {
              delete __clasifRapSel[_0x13aa0a.id];
            }
            _0x291be8.classList.toggle("sel", _0x1a0d97);
            _0x291be8.setAttribute("aria-pressed", _0x1a0d97 ? "true" : "false");
            _0x573577();
          });
          _0x59cb34.appendChild(_0x291be8);
        });
      };
      const _0x22f9fb = _0x95ed45.querySelector("[data-rap-filtro]");
      if (_0x22f9fb) {
        _0x22f9fb.value = __clasifRapFiltro;
        _0x22f9fb.addEventListener("input", () => {
          __clasifRapFiltro = _0x22f9fb.value;
          _0x293990();
        });
      }
      if (_0x50c6d4) {
        _0x50c6d4.addEventListener("click", async () => {
          const _0xaee904 = Object.keys(__clasifRapSel);
          if (!_0xaee904.length) {
            return;
          }
          if (!(await _0x328b69(_0x30ac7d))) {
            return;
          }
          let _0x3ca202 = 0;
          const _0x3c6f70 = [];
          _0xaee904.forEach(_0x32c8f2 => {
            const _0x4d74d3 = _0x513312.find(_0x17239b => _0x17239b.p.id === _0x32c8f2);
            if (!_0x4d74d3 || __clasifPQEnOrden(_0x30ac7d, _0x4d74d3.p, _0x4d74d3.cat)) {
              return;
            }
            const _0xe49b8d = 1;
            const _0x277924 = _0x4d74d3.cat;
            _0x30ac7d.pendiente.items.push(_0x277924 ? {
              id: nuevoId(),
              itemId: _0x277924.id,
              code: _0x277924.code,
              desc: _0x277924.desc,
              referencia: _0x277924.referencia || "",
              qty: _0xe49b8d,
              pedido: 0,
              reserva: 0,
              destino: "",
              tipo: "pequeno",
              tipoOk: true
            } : {
              id: nuevoId(),
              itemId: null,
              code: "",
              desc: "",
              referencia: "",
              textoLibre: _0x4d74d3.p.desc,
              qty: _0xe49b8d,
              pedido: 0,
              reserva: 0,
              destino: "",
              tipo: "pequeno",
              tipoOk: true
            });
            _0x3ca202++;
            _0x3c6f70.push((_0x277924 ? _0x277924.code : _0x4d74d3.p.desc) + " ×" + _0xe49b8d);
          });
          __clasifRapSel = {};
          __clasifRapFiltro = "";
          if (!_0x3ca202) {
            _0x279f78("Esos materiales ya están en la orden.");
            render();
            return;
          }
          anadirMensajeChat(_0x30ac7d.chat, "Pequeño material: " + _0x3c6f70.join(", ") + " (pide: " + (_0x30ac7d.pendiente.requesterName || "sin especificar") + ")");
          _0x29f0a4();
          try {
            if (_0x2df77d() === "taller") {
              const _0x11e7e3 = estado.current[estado.mode];
              const _0x46d8f8 = buscarGrupo(estado.mode, _0x11e7e3);
              enviarCorreoAviso("Nueva petición por chat — " + _0x11e7e3, "Pequeño material: " + _0x3c6f70.join(", ") + "\n\nPedido por: " + (_0x30ac7d.pendiente.requesterName || "sin especificar"));
              estado.notifications.unshift({
                id: nuevoId(),
                groupKind: estado.mode,
                groupName: _0x11e7e3,
                requesterName: _0x30ac7d.pendiente.requesterName || "sin especificar",
                tipo: _0x46d8f8 ? _0x46d8f8.tipo || "" : "",
                lineas: _0x3ca202,
                ts: fechaHoraTexto(),
                tsMs: Date.now(),
                leida: false
              });
              guardarAvisos();
            }
          } catch (_0x588e63) {}
          render();
        });
      }
      if (_0x1c6205) {
        const _0x551f5 = _0x95ed45.querySelector("[data-rap-gestion-caja]");
        _0x95ed45.querySelector("[data-rap-gestion]").addEventListener("click", () => {
          __clasifRapGestion = !__clasifRapGestion;
          render();
        });
        if (__clasifRapGestion) {
          let _0x22a4d1 = "<p style=\"font-size:12px; color:var(--text-muted); margin:10px 0 4px;\">Esta lista es independiente de las órdenes: quitar una línea de un pedido no la modifica. Solo se elimina aquí, de forma manual.</p>";
          _0x513312.forEach(_0x1a87e9 => {
            _0x22a4d1 += "<div class=\"clasif-fila\"><div class=\"clasif-desc\">" + (_0x1a87e9.p.code ? "<strong>" + _0x11a83f(_0x1a87e9.p.code) + "</strong> — " + _0x11a83f(_0x1a87e9.p.desc || "") : _0x11a83f(_0x1a87e9.p.desc || "")) + "</div><div class=\"clasif-seg\" data-pq-id=\"" + _0x11a83f(_0x1a87e9.p.id) + "\"><button type=\"button\" data-pq=\"borrar\">Eliminar</button></div></div>";
          });
          _0x22a4d1 += "<div class=\"scanner-row\" style=\"margin-top:8px;\"><input type=\"text\" data-pq-nuevo placeholder=\"Código o nombre del material\" style=\"flex:2;\"><button type=\"button\" class=\"cam-btn\" data-pq-anadir style=\"flex:1;\">Añadir a la lista</button></div>";
          _0x551f5.innerHTML = _0x22a4d1;
          _0x551f5.querySelectorAll("[data-pq=\"borrar\"]").forEach(_0x5ee6a1 => {
            _0x5ee6a1.addEventListener("click", async () => {
              const _0x574bbd = _0x513312.find(_0x482249 => _0x482249.p.id === _0x5ee6a1.parentNode.getAttribute("data-pq-id"));
              if (!_0x574bbd) {
                return;
              }
              if (!(await _0x2cc777("¿Eliminar «" + (_0x574bbd.p.code || _0x574bbd.p.desc) + "» de la lista de pequeño material? No modifica ninguna orden."))) {
                return;
              }
              const _0x19a7ec = __clasifStore();
              _0x19a7ec.pq = _0x19a7ec.pq.filter(_0x92b7e2 => _0x92b7e2.id !== _0x574bbd.p.id);
              delete __clasifRapSel[_0x574bbd.p.id];
              __guardarClasif();
              render();
            });
          });
          _0x551f5.querySelector("[data-pq-anadir]").addEventListener("click", () => {
            const _0x3b9895 = _0x551f5.querySelector("[data-pq-nuevo]").value.trim();
            if (!_0x3b9895) {
              return;
            }
            const _0x1391a7 = buscarPorCodigo(_0x3b9895);
            __clasifRegistrarPQ(_0x1391a7 ? {
              code: _0x1391a7.code,
              desc: _0x1391a7.desc
            } : {
              code: "",
              desc: _0x3b9895,
              textoLibre: _0x3b9895
            });
            __guardarClasif();
            render();
          });
        }
      }
      if (_0x59cb34) {
        _0x293990();
        _0x573577();
      }
      _0x3f47a6.parentNode.insertBefore(_0x95ed45, _0x3f47a6);
    } catch (_0x33e6f2) {}
  }
  const __CATEGORIA_ROPA = "Ropa";
  let __ropaExcluidas = new Set();
  function __ropaCatalogo() {
    return (estado.catalog || []).filter(_0x4b0a69 => __clasifNormalizar(_0x4b0a69.categoria) === "ropa").sort((_0x5542c2, _0x580441) => String(_0x5542c2.desc || _0x5542c2.code).localeCompare(String(_0x580441.desc || _0x580441.code), "es"));
  }
  function __ropaItem(_0x30e3ba) {
    return (estado.catalog || []).find(_0x5debf8 => _0x5debf8.id === _0x30e3ba) || null;
  }
  function __ropaTexto(_0xd57b9f) {
    return _0xd57b9f.code + " — " + (_0xd57b9f.desc || "");
  }
  function __ropaCantidad(_0xbf38ba) {
    return Math.max(1, parseInt(_0xbf38ba, 10) || 1);
  }
  function __ropaFecha(_0x2aff67) {
    return new Date(_0x2aff67).toLocaleString("es-ES", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }
  function __ropaLineaTexto(_0x4ebc1f) {
    return "- " + _0x4ebc1f.code + " — " + (_0x4ebc1f.desc || "") + " — " + _0x4ebc1f.qty + (_0x4ebc1f.qty === 1 ? " unidad" : " unidades");
  }
  function __ropaListadoTexto(_0x4a96e6) {
    return "Ropa entregada a «" + _0x4a96e6.nombre + "»:\n" + (_0x4a96e6.entregas || []).map(_0x5b50db => "\n" + __ropaFecha(_0x5b50db.ts) + "\n" + _0x5b50db.lineas.map(__ropaLineaTexto).join("\n")).join("\n");
  }
  function __ropaDescargar(_0x229e73) {
    if (typeof XLSX === "undefined") {
      _0x279f78("No se pudo generar el archivo: falta la librería de Excel (¿sin conexión?).");
      return;
    }
    const _0x5a611a = [];
    (_0x229e73.entregas || []).forEach(_0x243172 => _0x243172.lineas.forEach(_0x3b2c3a => _0x5a611a.push({
      Trabajador: _0x229e73.nombre,
      Fecha: __ropaFecha(_0x243172.ts),
      Código: _0x3b2c3a.code,
      Artículo: _0x3b2c3a.desc || "",
      Cantidad: _0x3b2c3a.qty
    })));
    const _0x543a2e = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(_0x543a2e, XLSX.utils.json_to_sheet(_0x5a611a), "Ropa entregada");
    XLSX.writeFile(_0x543a2e, "ropa_" + String(_0x229e73.nombre).replace(/[^\w.-]+/g, "_") + "_" + new Date().toISOString().slice(0, 10) + ".xlsx");
  }
  async function __ropaEntregar(_0x2c8316) {
    const _0x196387 = (_0x2c8316.ropa || []).filter(_0x2b56a8 => !__ropaExcluidas.has(_0x2c8316.id + "|" + _0x2b56a8.itemId));
    if (!_0x196387.length) {
      _0x279f78("Selecciona al menos una prenda para entregar.");
      return;
    }
    const _0x7cd920 = [];
    _0x196387.forEach(_0x29ff53 => {
      const _0x4e156b = __ropaItem(_0x29ff53.itemId);
      if (!_0x4e156b) {
        _0x7cd920.push("una referencia ya no existe en el stock");
      } else if ((parseInt(_0x4e156b.qty, 10) || 0) < _0x29ff53.qty) {
        _0x7cd920.push(__ropaTexto(_0x4e156b) + " (hay " + (parseInt(_0x4e156b.qty, 10) || 0) + ", se necesitan " + _0x29ff53.qty + ")");
      }
    });
    if (_0x7cd920.length) {
      _0x279f78("No se puede entregar: " + _0x7cd920.join("; ") + ".");
      return;
    }
    const _0x4baf2b = _0x196387.map(_0x42b4ed => {
      const _0x59981a = __ropaItem(_0x42b4ed.itemId);
      return {
        itemId: _0x59981a.id,
        code: _0x59981a.code,
        desc: _0x59981a.desc || "",
        qty: _0x42b4ed.qty
      };
    });
    if (!(await _0x2cc777("Entregar a «" + _0x2c8316.nombre + "»:\n" + _0x4baf2b.map(__ropaLineaTexto).join("\n") + "\n\nSe descontará del stock. La ficha conserva las prendas."))) {
      return;
    }
    _0x4baf2b.forEach(_0x558578 => _0x1d4277(__ropaItem(_0x558578.itemId), _0x558578.qty, "salida", "Entrega de ropa — " + _0x2c8316.nombre));
    (_0x2c8316.entregas = _0x2c8316.entregas || []).push({
      id: nuevoId(),
      ts: Date.now(),
      lineas: _0x4baf2b
    });
    __guardarTrabajadores();
    _0x279f78("Ropa entregada y descontada del stock.");
    render();
  }
  async function __ropaAnular(_0x4d517c, _0x27042c) {
    if (!(await _0x2cc777("¿Anular la entrega del " + __ropaFecha(_0x27042c.ts) + "? Las prendas vuelven al stock."))) {
      return;
    }
    _0x27042c.lineas.forEach(_0x2fc857 => {
      const _0xe466b6 = __ropaItem(_0x2fc857.itemId);
      if (_0xe466b6) {
        _0x1d4277(_0xe466b6, _0x2fc857.qty, "entrada", "Anulación de entrega de ropa — " + _0x4d517c.nombre);
      }
    });
    _0x4d517c.entregas = _0x4d517c.entregas.filter(_0x4cbfdf => _0x4cbfdf.id !== _0x27042c.id);
    __guardarTrabajadores();
    render();
  }
  const __fichaEditando = new Set();
  function __fichaCreada(_0x363b8e) {
    return !!_0x363b8e.ficha || (_0x363b8e.entregas || []).length > 0;
  }
  function __anadirTrabajador() {
    const _0x11a697 = $("#nuevoTrabajadorNombre");
    const _0x5147e3 = (_0x11a697 && _0x11a697.value || "").trim();
    if (!_0x5147e3) {
      return;
    }
    const _0x27786c = {
      id: nuevoId(),
      nombre: _0x5147e3,
      ropa: [],
      entregas: []
    };
    estado.trabajadores = estado.trabajadores || [];
    estado.trabajadores.push(_0x27786c);
    __trabajadorActualId = _0x27786c.id;
    __guardarTrabajadores();
    render();
  }
  function __renderTrabajadores() {
    if (estado.mode !== "trabajadores") {
      return;
    }
    const _0x1b7557 = $("#mainList");
    if (!_0x1b7557) {
      return;
    }
    const _0x3f3ab2 = _0x1d1ab0;
    const _0x35473d = _0x2df77d() === "almacen";
    const _0x43b96c = estado.trabajadores || [];
    const _0x471ec1 = _0x43b96c.find(_0x3e6dc3 => _0x3e6dc3.id === __trabajadorActualId) || _0x43b96c[0] || null;
    if (_0x471ec1 && _0x471ec1.id !== __trabajadorActualId) {
      __trabajadorActualId = _0x471ec1.id;
    }
    const _0x513993 = __ropaCatalogo();
    const _0x42d05f = "<p style=\"color:var(--text-faint); font-size:12.5px; margin:0;\">No hay referencias en la categoría «" + __CATEGORIA_ROPA + "». Se asigna desde Almacén → Editar → Categoría.</p>";
    let _0x87b1ae = "<div class=\"panel\"><p class=\"panel-title\">Trabajadores</p><div style=\"display:flex; gap:8px; margin-bottom:6px;\"><input type=\"text\" id=\"nuevoTrabajadorNombre\" placeholder=\"Nombre del trabajador\" style=\"flex:1;\"><button class=\"btn primary\" id=\"anadirTrabajadorBtn\" style=\"width:auto; padding:8px 16px;\">Añadir</button></div><p style=\"color:var(--text-faint); font-size:12.5px; margin:0;\">Primero se añade el trabajador; después se le asigna la ropa y se crea su ficha.</p>" + (_0x35473d ? "<div style=\"display:flex; gap:8px; align-items:center; margin-top:12px; font-size:13px;\"><label for=\"ropaMesesInput\">Renovar la ropa cada</label><input type=\"number\" id=\"ropaMesesInput\" min=\"1\" max=\"60\" value=\"" + __ropaMeses() + "\" style=\"width:64px;\"><span>meses</span></div>" : "") + (_0x43b96c.length ? "<div style=\"display:flex; flex-wrap:wrap; gap:8px; margin-top:14px;\">" + _0x43b96c.map(_0x341de1 => "<button class=\"btn" + (_0x471ec1 && _0x341de1.id === _0x471ec1.id ? " primary" : "") + "\" data-trabajador-id=\"" + _0x3f3ab2(_0x341de1.id) + "\" style=\"width:auto; padding:8px 14px;\">" + _0x3f3ab2(_0x341de1.nombre) + "</button>").join("") + "</div>" : "<p style=\"color:var(--text-faint); font-size:13.5px; margin-top:14px;\">Todavía no hay trabajadores añadidos.</p>") + "</div>";
    const _0xf0cbd = __ropaRenovaciones();
    if (_0xf0cbd.length) {
      _0x87b1ae += "<div class=\"panel\" style=\"margin-top:14px;\"><p class=\"panel-title\">Ropa por renovar (" + _0xf0cbd.length + ")</p>" + _0xf0cbd.slice(0, 30).map(_0x16cc99 => {
        const _0x4950cd = __ropaItem(_0x16cc99.r.itemId);
        return "<div class=\"clasif-fila\"><span class=\"clasif-desc\">" + _0x3f3ab2(_0x16cc99.t.nombre) + "<br><small>" + (_0x4950cd ? _0x3f3ab2(__ropaTexto(_0x4950cd)) : "Referencia eliminada") + " · tocaba el " + _0x3f3ab2(__ropaFecha(_0x16cc99.vence).split(",")[0]) + "</small></span><div class=\"clasif-seg\"><button type=\"button\" data-ropa-ren=\"" + _0x3f3ab2(_0x16cc99.t.id) + "\">Abrir ficha</button></div></div>";
      }).join("") + "</div>";
    }
    if (_0x471ec1) {
      const _0x5a8334 = _0x471ec1.ropa || [];
      const _0x39bf3e = __fichaCreada(_0x471ec1);
      const _0x592db6 = !_0x39bf3e || __fichaEditando.has(_0x471ec1.id);
      const _0xf3a67 = (_0x471ec1.entregas || []).slice().reverse();
      const _0x50775c = new Map();
      (_0x471ec1.entregas || []).forEach(_0x1d9c8b => _0x1d9c8b.lineas.forEach(_0x184eb1 => _0x50775c.set(_0x184eb1.itemId, (_0x50775c.get(_0x184eb1.itemId) || 0) + _0x184eb1.qty)));
      const _0x19bdaf = new Set(_0x5a8334.map(_0x47a95e => _0x47a95e.itemId));
      const _0x54a61d = _0x513993.filter(_0x252420 => !_0x19bdaf.has(_0x252420.id));
      const _0x20f91a = _0x5a8334.length ? _0x5a8334.map(_0x1c8a8d => {
        const _0x580e05 = __ropaItem(_0x1c8a8d.itemId);
        const _0x49ec52 = (_0x580e05 ? _0x3f3ab2(__ropaTexto(_0x580e05)) : "<em>Referencia eliminada del stock</em>") + (_0x50775c.get(_0x1c8a8d.itemId) ? "<br><small>Entregado hasta ahora: " + _0x50775c.get(_0x1c8a8d.itemId) + " · última: " + _0x3f3ab2(__ropaFecha(__ropaUltima(_0x471ec1, _0x1c8a8d.itemId)).split(",")[0]) + (__ropaVence(_0x471ec1, _0x1c8a8d.itemId) <= Date.now() ? " · <strong>toca renovar</strong>" : "") + "</small>" : "");
        if (_0x592db6) {
          return "<div class=\"clasif-fila\"><span class=\"clasif-desc\">" + _0x49ec52 + "</span><div class=\"clasif-seg\"><input type=\"number\" min=\"1\" value=\"" + __ropaCantidad(_0x1c8a8d.qty) + "\" data-ropa-qty=\"" + _0x3f3ab2(_0x1c8a8d.itemId) + "\" style=\"width:64px;\"><button type=\"button\" data-ropa-quitar=\"" + _0x3f3ab2(_0x1c8a8d.itemId) + "\">Quitar</button></div></div>";
        }
        const _0x4c590e = _0x35473d ? "<input type=\"checkbox\" data-ropa-inc=\"" + _0x3f3ab2(_0x1c8a8d.itemId) + "\"" + (__ropaExcluidas.has(_0x471ec1.id + "|" + _0x1c8a8d.itemId) ? "" : " checked") + " style=\"width:auto; margin:0; flex:none;\">" : "";
        return "<div class=\"clasif-fila\"><label class=\"clasif-desc\" style=\"display:flex; gap:8px; align-items:center;\">" + _0x4c590e + "<span>" + _0x49ec52 + "</span></label><strong>×" + __ropaCantidad(_0x1c8a8d.qty) + "</strong></div>";
      }).join("") : "<p style=\"color:var(--text-faint); font-size:13.5px;\">Todavía no tiene ropa asignada.</p>";
      _0x87b1ae += "<div class=\"panel\" style=\"margin-top:14px;\"><div style=\"display:flex; justify-content:space-between; align-items:center; gap:8px;\">" + (_0x592db6 ? "<input type=\"text\" id=\"fichaNombre\" value=\"" + _0x3f3ab2(_0x471ec1.nombre) + "\" aria-label=\"Nombre del trabajador\" style=\"flex:1; min-width:0; font-weight:700;\">" : "<p class=\"panel-title\" style=\"margin:0;\">" + _0x3f3ab2(_0x471ec1.nombre) + "</p>") + (_0x39bf3e ? "<button class=\"btn\" data-ficha-editar=\"" + _0x3f3ab2(_0x471ec1.id) + "\" style=\"width:auto; padding:6px 14px;\">" + (_0x592db6 ? "Listo" : "Editar") + "</button>" : "") + "<button class=\"btn ghost-danger\" data-quitar-trabajador=\"" + _0x3f3ab2(_0x471ec1.id) + "\" style=\"width:auto; padding:6px 14px;\">Eliminar</button></div><p class=\"panel-title\" style=\"font-size:14px; margin-top:16px;\">" + (_0x39bf3e ? "Ficha de ropa" + (_0x471ec1.ficha ? " · creada el " + _0x3f3ab2(__ropaFecha(_0x471ec1.ficha.ts)) : "") : "Ropa asignada (borrador)") + "</p><p style=\"color:var(--text-faint); font-size:12.5px; margin:0 0 4px;\">" + (_0x39bf3e ? "Nada descuenta stock hasta pulsar «Entregar». Las prendas se conservan en la ficha después de entregar." : "Asigna las prendas y pulsa «Crear ficha». Hasta entonces no hay ficha y no se descuenta nada del stock.") + "</p>" + _0x20f91a + (_0x592db6 ? _0x54a61d.length ? "<div style=\"display:flex; gap:8px; margin-top:12px; flex-wrap:wrap;\"><select id=\"ropaAsignarSel\" style=\"flex:1 1 200px; min-width:0;\">" + _0x54a61d.map(_0x432f0f => "<option value=\"" + _0x3f3ab2(_0x432f0f.id) + "\">" + _0x3f3ab2(__ropaTexto(_0x432f0f)) + "</option>").join("") + "</select><input type=\"number\" id=\"ropaAsignarQty\" min=\"1\" value=\"1\" style=\"width:72px;\"><button class=\"btn primary\" id=\"ropaAsignarBtn\" style=\"width:auto; padding:8px 16px;\">" + (_0x39bf3e ? "Añadir a la ficha" : "Asignar") + "</button></div>" : _0x513993.length ? "" : "<div style=\"margin-top:12px;\">" + _0x42d05f + "</div>" : "") + (!_0x39bf3e ? "<button type=\"button\" class=\"btn primary\" id=\"fichaCrearBtn\" style=\"width:100%; margin-top:14px;\"" + (_0x5a8334.length ? "" : " disabled") + ">Crear ficha</button>" : "") + (_0x39bf3e && !_0x592db6 && _0x35473d && _0x5a8334.length ? "<button type=\"button\" class=\"btn primary\" id=\"ropaEntregarBtn\" style=\"width:100%; margin-top:14px;\"></button>" : "") + (_0x39bf3e ? "<p class=\"panel-title\" style=\"font-size:14px; margin-top:20px;\">Listado de ropa entregada</p>" + (_0xf3a67.length ? _0xf3a67.map(_0x52e856 => "<div class=\"clasif-fila\" style=\"align-items:flex-start;\"><div class=\"clasif-desc\"><strong>" + _0x3f3ab2(__ropaFecha(_0x52e856.ts)) + "</strong><br>" + _0x52e856.lineas.map(_0x13cfb8 => "<small>" + _0x3f3ab2(__ropaLineaTexto(_0x13cfb8).slice(2)) + "</small>").join("<br>") + "</div><div class=\"clasif-seg\"><button type=\"button\" data-ropa-hoja=\"" + _0x3f3ab2(_0x52e856.id) + "\">Hoja firmable</button>" + (_0x35473d ? "<button type=\"button\" data-ropa-anular=\"" + _0x3f3ab2(_0x52e856.id) + "\">Anular</button>" : "") + "</div></div>").join("") + "<div class=\"scanner-row\" style=\"margin-top:10px;\"><button type=\"button\" class=\"cam-btn\" id=\"ropaCopiarBtn\" style=\"flex:1;\">Copiar listado</button><button type=\"button\" class=\"cam-btn\" id=\"ropaDescargarBtn\" style=\"flex:1;\">Descargar listado (Excel)</button></div>" : "<p style=\"color:var(--text-faint); font-size:13.5px;\">Todavía no se le ha entregado ropa.</p>") : "") + "</div>";
    }
    _0x1b7557.innerHTML = _0x87b1ae;
    const _0x5b6efd = $("#ropaMesesInput");
    if (_0x5b6efd) {
      _0x5b6efd.addEventListener("change", () => {
        const _0x50f0a8 = Math.min(60, Math.max(1, parseInt(_0x5b6efd.value, 10) || 12));
        estado.settings.ropaMeses = _0x50f0a8;
        guardar("settings", estado.settings);
        render();
      });
    }
    _0x1b7557.querySelectorAll("[data-ropa-ren]").forEach(_0xb90c => {
      _0xb90c.addEventListener("click", () => {
        __trabajadorActualId = _0xb90c.getAttribute("data-ropa-ren");
        render();
      });
    });
    const _0xa665e9 = $("#anadirTrabajadorBtn");
    if (_0xa665e9) {
      _0xa665e9.addEventListener("click", __anadirTrabajador);
    }
    const _0x3550a2 = $("#nuevoTrabajadorNombre");
    if (_0x3550a2) {
      _0x3550a2.addEventListener("keydown", _0x3e687a => {
        if (_0x3e687a.key === "Enter") {
          __anadirTrabajador();
        }
      });
    }
    _0x1b7557.querySelectorAll("[data-trabajador-id]").forEach(_0x5562e1 => {
      _0x5562e1.addEventListener("click", () => {
        __trabajadorActualId = _0x5562e1.getAttribute("data-trabajador-id");
        render();
      });
    });
    _0x1b7557.querySelectorAll("[data-quitar-trabajador]").forEach(_0x5e87b9 => {
      _0x5e87b9.addEventListener("click", () => {
        const _0x48afb0 = _0x5e87b9.getAttribute("data-quitar-trabajador");
        estado.trabajadores = (estado.trabajadores || []).filter(_0x9096e3 => _0x9096e3.id !== _0x48afb0);
        __fichaEditando.delete(_0x48afb0);
        if (__trabajadorActualId === _0x48afb0) {
          __trabajadorActualId = null;
        }
        __guardarTrabajadores();
        render();
      });
    });
    if (!_0x471ec1) {
      return;
    }
    const _0x5792d9 = $("#fichaNombre");
    if (_0x5792d9) {
      _0x5792d9.addEventListener("change", () => {
        const _0x55e76f = _0x5792d9.value.trim();
        if (_0x55e76f) {
          _0x471ec1.nombre = _0x55e76f;
        }
        __guardarTrabajadores();
        render();
      });
    }
    const _0x1aa089 = _0x471ec1.ropa = _0x471ec1.ropa || [];
    const _0x1cb30b = $("#fichaCrearBtn");
    if (_0x1cb30b) {
      _0x1cb30b.addEventListener("click", () => {
        if (!_0x1aa089.length) {
          return;
        }
        _0x471ec1.ficha = {
          ts: Date.now()
        };
        __guardarTrabajadores();
        _0x279f78("Ficha creada. No se ha descontado nada del stock.");
        render();
      });
    }
    const _0x333bc6 = $("[data-ficha-editar]");
    if (_0x333bc6) {
      _0x333bc6.addEventListener("click", () => {
        if (__fichaEditando.has(_0x471ec1.id)) {
          __fichaEditando.delete(_0x471ec1.id);
        } else {
          __fichaEditando.add(_0x471ec1.id);
        }
        render();
      });
    }
    const _0x53252e = $("#ropaAsignarBtn");
    if (_0x53252e) {
      _0x53252e.addEventListener("click", () => {
        _0x1aa089.push({
          itemId: $("#ropaAsignarSel").value,
          qty: __ropaCantidad($("#ropaAsignarQty").value)
        });
        __guardarTrabajadores();
        render();
      });
    }
    _0x1b7557.querySelectorAll("[data-ropa-quitar]").forEach(_0x1fddd4 => {
      _0x1fddd4.addEventListener("click", () => {
        _0x471ec1.ropa = _0x1aa089.filter(_0x1fc020 => _0x1fc020.itemId !== _0x1fddd4.getAttribute("data-ropa-quitar"));
        __guardarTrabajadores();
        render();
      });
    });
    const _0x2d0df5 = $("#ropaEntregarBtn");
    const _0x5f9c2d = () => {
      if (!_0x2d0df5) {
        return;
      }
      const _0x2a6a07 = _0x1aa089.filter(_0x336cb3 => !__ropaExcluidas.has(_0x471ec1.id + "|" + _0x336cb3.itemId)).length;
      _0x2d0df5.textContent = "Entregar la ropa marcada (" + _0x2a6a07 + ") — descuenta del stock";
      _0x2d0df5.disabled = !_0x2a6a07;
    };
    _0x5f9c2d();
    if (_0x2d0df5) {
      _0x2d0df5.addEventListener("click", () => __ropaEntregar(_0x471ec1));
    }
    _0x1b7557.querySelectorAll("[data-ropa-inc]").forEach(_0x4a39cb => {
      _0x4a39cb.addEventListener("change", () => {
        const _0x16aa96 = _0x471ec1.id + "|" + _0x4a39cb.getAttribute("data-ropa-inc");
        if (_0x4a39cb.checked) {
          __ropaExcluidas.delete(_0x16aa96);
        } else {
          __ropaExcluidas.add(_0x16aa96);
        }
        _0x5f9c2d();
      });
    });
    _0x1b7557.querySelectorAll("[data-ropa-qty]").forEach(_0x9ce9e7 => {
      _0x9ce9e7.addEventListener("change", () => {
        const _0x4da951 = _0x1aa089.find(_0x490905 => _0x490905.itemId === _0x9ce9e7.getAttribute("data-ropa-qty"));
        if (!_0x4da951) {
          return;
        }
        _0x4da951.qty = __ropaCantidad(_0x9ce9e7.value);
        _0x9ce9e7.value = _0x4da951.qty;
        __guardarTrabajadores();
      });
    });
    _0x1b7557.querySelectorAll("[data-ropa-anular]").forEach(_0x23b395 => {
      _0x23b395.addEventListener("click", () => {
        const _0x41ae5f = (_0x471ec1.entregas || []).find(_0x5a8f3e => _0x5a8f3e.id === _0x23b395.getAttribute("data-ropa-anular"));
        if (_0x41ae5f) {
          __ropaAnular(_0x471ec1, _0x41ae5f);
        }
      });
    });
    _0x1b7557.querySelectorAll("[data-ropa-hoja]").forEach(_0xe36403 => {
      _0xe36403.addEventListener("click", () => {
        const _0x266eb1 = (_0x471ec1.entregas || []).find(_0x5dd413 => _0x5dd413.id === _0xe36403.getAttribute("data-ropa-hoja"));
        if (_0x266eb1) {
          __imprimirLote(__ropaHoja(_0x471ec1, _0x266eb1), "A4; margin:18mm");
        }
      });
    });
    const _0x217900 = $("#ropaCopiarBtn");
    if (_0x217900) {
      _0x217900.addEventListener("click", () => __clasifCopiar(__ropaListadoTexto(_0x471ec1)));
    }
    const _0xde6557 = $("#ropaDescargarBtn");
    if (_0xde6557) {
      _0xde6557.addEventListener("click", () => __ropaDescargar(_0x471ec1));
    }
  }
  const __ETQ_FORMATOS = [{
    id: "62x29",
    nombre: "62 × 29 mm · DK-11209",
    w: 62,
    h: 29,
    px: 3,
    py: 2
  }, {
    id: "29x90",
    nombre: "29 × 90 mm · DK-11201",
    w: 29,
    h: 90,
    px: 2,
    py: 2
  }, {
    id: "38x90",
    nombre: "38 × 90 mm · DK-11208",
    w: 38,
    h: 90,
    px: 2.5,
    py: 2
  }, {
    id: "17x54",
    nombre: "17 × 54 mm · DK-11204",
    w: 17,
    h: 54,
    px: 2.5,
    py: 2
  }, {
    id: "62c",
    nombre: "62 mm continuo · DK-22205 (30 mm de largo)",
    w: 62,
    h: 30,
    px: 3,
    py: 2
  }];
  const __ETQ_MAX = 300;
  let __etqSelRef = new Map();
  let __etqSelUb = new Map();
  let __etqExtra = [];
  let __etqTipo = "ref";
  let __etqFormatoId = "62x29";
  let __herrCierre = null;
  let __camaraActiva = null;
  function __cargarBarras() {
    if (window.JsBarcode) {
      return Promise.resolve(true);
    }
    return new Promise(_0xe820a8 => {
      const _0x377ef9 = document.createElement("script");
      _0x377ef9.src = "https://cdnjs.cloudflare.com/ajax/libs/jsbarcode/3.11.6/JsBarcode.all.min.js";
      _0x377ef9.onload = () => _0xe820a8(!!window.JsBarcode);
      _0x377ef9.onerror = () => _0xe820a8(false);
      document.head.appendChild(_0x377ef9);
    });
  }
  function __numeroMm(_0x455a15) {
    return String(Math.round(_0x455a15 * 100) / 100) + "mm";
  }
  function __herrOverlay(_0x4af53a) {
    if (__herrCierre) {
      __herrCierre();
    }
    const _0x2b6ce4 = document.createElement("div");
    _0x2b6ce4.id = "herrOverlay";
    const _0x40a609 = document.createElement("div");
    _0x40a609.className = "herr-card";
    const _0xb32b9c = document.createElement("div");
    _0xb32b9c.className = "herr-cab";
    const _0x29a44e = document.createElement("strong");
    _0x29a44e.textContent = _0x4af53a;
    const _0xe6f871 = document.createElement("button");
    _0xe6f871.type = "button";
    _0xe6f871.className = "cam-btn";
    _0xe6f871.id = "herrCerrarBtn";
    _0xe6f871.textContent = "Cerrar";
    const _0x173d01 = document.createElement("div");
    _0x173d01.id = "herrCuerpo";
    _0xb32b9c.append(_0x29a44e, _0xe6f871);
    _0x40a609.append(_0xb32b9c, _0x173d01);
    _0x2b6ce4.appendChild(_0x40a609);
    document.body.appendChild(_0x2b6ce4);
    const _0x4aba9f = _0x3a9f63 => {
      if (_0x3a9f63.key === "Escape" && !document.getElementById("herrCamara")) {
        _0x485903();
      }
    };
    const _0x485903 = () => {
      if (__camaraActiva) {
        __camaraActiva.cerrar();
      }
      _0x2b6ce4.remove();
      document.removeEventListener("keydown", _0x4aba9f);
      __herrCierre = null;
    };
    __herrCierre = _0x485903;
    document.addEventListener("keydown", _0x4aba9f);
    _0xe6f871.addEventListener("click", _0x485903);
    return _0x173d01;
  }
  function __herrBoton(_0x1b4bd1, _0x1deb96, _0x3cafa2) {
    const _0x3807c9 = document.createElement("button");
    _0x3807c9.type = "button";
    _0x3807c9.id = _0x1b4bd1;
    _0x3807c9.className = _0x3cafa2 || "cam-btn";
    _0x3807c9.textContent = _0x1deb96;
    return _0x3807c9;
  }
  function __etqFormato() {
    return __ETQ_FORMATOS.find(_0x38a05b => _0x38a05b.id === __etqFormatoId) || __ETQ_FORMATOS[0];
  }
  function __etqUbicaciones() {
    const _0x27dbf4 = new Set((estado.ubicaciones || []).map(_0x432c1e => String(_0x432c1e).trim()));
    (estado.catalog || []).forEach(_0x4ecf90 => {
      if (_0x4ecf90 && _0x4ecf90.location) {
        _0x27dbf4.add(String(_0x4ecf90.location).trim());
      }
    });
    __etqExtra.forEach(_0x1a1294 => _0x27dbf4.add(_0x1a1294));
    return [..._0x27dbf4].filter(Boolean).sort((_0x1fc60e, _0x5be86c) => _0x1fc60e.localeCompare(_0x5be86c, "es", {
      numeric: true
    }));
  }
  function __etqBarras(_0x22fb98, _0x4af433) {
    if (!window.JsBarcode) {
      return null;
    }
    const _0x3794b6 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    try {
      JsBarcode(_0x3794b6, _0x22fb98, {
        format: "CODE128",
        displayValue: false,
        margin: 0,
        width: 2,
        height: 40
      });
    } catch (_0x5b02d0) {
      return null;
    }
    const _0x3f4da8 = parseFloat(_0x3794b6.getAttribute("width"));
    const _0x38f413 = parseFloat(_0x3794b6.getAttribute("height"));
    if (!(_0x3f4da8 > 0) || !(_0x38f413 > 0)) {
      return null;
    }
    _0x3794b6.setAttribute("viewBox", "0 0 " + _0x3f4da8 + " " + _0x38f413);
    _0x3794b6.removeAttribute("width");
    _0x3794b6.removeAttribute("height");
    _0x3794b6.setAttribute("preserveAspectRatio", "none");
    _0x3794b6.style.cssText = "display:block; width:100%; height:" + __numeroMm(_0x4af433) + ";";
    return _0x3794b6;
  }
  function __etqTexto(_0x476689, _0x5284e4, _0x209fb5, _0x3fefcd) {
    const _0x4c3f79 = document.createElement("div");
    _0x4c3f79.className = _0x476689;
    _0x4c3f79.textContent = _0x5284e4;
    _0x4c3f79.style.cssText = "font-size:" + __numeroMm(_0x209fb5) + "; line-height:1.15; " + (_0x3fefcd || "");
    return _0x4c3f79;
  }
  function __etqNodo(_0xd8d80a, _0x16ce6c) {
    const _0x10ec83 = _0x16ce6c.w < 40 && _0x16ce6c.h > _0x16ce6c.w;
    const _0x2d5d18 = _0x10ec83 ? _0x16ce6c.h - _0x16ce6c.py * 2 : _0x16ce6c.w - _0x16ce6c.px * 2;
    const _0x3527b1 = _0x10ec83 ? _0x16ce6c.w - _0x16ce6c.px * 2 : _0x16ce6c.h - _0x16ce6c.py * 2;
    const _0x3d7585 = document.createElement("div");
    _0x3d7585.className = "etq";
    _0x3d7585.style.cssText = "position:relative; overflow:hidden; box-sizing:border-box; background:#fff; color:#000; width:" + __numeroMm(_0x16ce6c.w) + "; height:" + __numeroMm(_0x16ce6c.h) + ";";
    const _0x2e32ef = document.createElement("div");
    _0x2e32ef.className = "etq-in";
    _0x2e32ef.style.cssText = "position:absolute; display:flex; flex-direction:column; justify-content:space-between; font-family:Arial,Helvetica,sans-serif; overflow:hidden; width:" + __numeroMm(_0x2d5d18) + "; height:" + __numeroMm(_0x3527b1) + "; top:" + __numeroMm(_0x16ce6c.py) + "; " + (_0x10ec83 ? "left:" + __numeroMm(_0x16ce6c.px + _0x3527b1) + "; transform-origin:0 0; transform:rotate(90deg);" : "left:" + __numeroMm(_0x16ce6c.px) + ";");
    const _0x38e48a = _0xd8d80a.tipo === "ub";
    const _0x4da854 = Math.min(14, Math.round(_0x3527b1 * (_0x38e48a ? 0.36 : 0.4) * 10) / 10);
    const _0x3380db = Math.max(2.8, Math.min(_0x38e48a ? 9 : 4.8, Math.round(_0x3527b1 * (_0x38e48a ? 0.3 : 0.17) * 10) / 10));
    const _0x3e2d56 = Math.max(2.2, Math.min(3.2, Math.round(_0x3527b1 * 0.105 * 10) / 10));
    const _0x58638c = __etqBarras(_0xd8d80a.codigo, _0x4da854);
    if (_0x58638c) {
      _0x2e32ef.appendChild(_0x58638c);
    }
    const _0x157be0 = document.createElement("div");
    _0x157be0.style.cssText = "display:flex; justify-content:space-between; align-items:baseline; gap:2mm; min-width:0;";
    _0x157be0.appendChild(__etqTexto("etq-cod", _0xd8d80a.titulo, _0x3380db, "font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; min-width:0;"));
    if (!_0x38e48a && _0xd8d80a.ub && _0x2d5d18 >= 40) {
      _0x157be0.appendChild(__etqTexto("etq-ub", "Ub. " + _0xd8d80a.ub, _0x3e2d56, "white-space:nowrap; flex:none;"));
    }
    _0x2e32ef.appendChild(_0x157be0);
    if (!_0x38e48a && _0xd8d80a.desc) {
      const _0x3cd445 = Math.max(1, Math.floor((_0x3527b1 - _0x4da854 - _0x3380db * 1.25 - 1) / (_0x3e2d56 * 1.2)));
      _0x2e32ef.appendChild(__etqTexto("etq-desc", _0xd8d80a.desc, _0x3e2d56, "overflow:hidden; display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:" + _0x3cd445 + ";"));
    }
    _0x3d7585.appendChild(_0x2e32ef);
    return _0x3d7585;
  }
  function __etqDatos() {
    const _0x1fb7de = [];
    if (__etqTipo === "ref") {
      __etqSelRef.forEach((_0x139293, _0xd8c9b5) => {
        const _0x1ae0fa = (estado.catalog || []).find(_0x298944 => _0x298944.id === _0xd8c9b5);
        if (_0x1ae0fa && _0x1ae0fa.code) {
          for (let _0x21955c = 0; _0x21955c < _0x139293; _0x21955c++) {
            _0x1fb7de.push({
              tipo: "ref",
              codigo: String(_0x1ae0fa.code),
              titulo: String(_0x1ae0fa.code),
              desc: _0x1ae0fa.desc || "",
              ub: _0x1ae0fa.location || ""
            });
          }
        }
      });
    } else {
      __etqSelUb.forEach((_0x57c900, _0x299145) => {
        for (let _0x165537 = 0; _0x165537 < _0x57c900; _0x165537++) {
          _0x1fb7de.push({
            tipo: "ub",
            codigo: "UB-" + _0x299145,
            titulo: _0x299145
          });
        }
      });
    }
    return _0x1fb7de;
  }
  function __imprimirLote(_0x38491f, _0x75a6c6) {
    __limpiarLote();
    const _0x478680 = document.createElement("div");
    _0x478680.id = "etqLote";
    _0x478680.appendChild(_0x38491f);
    const _0x16314b = document.createElement("style");
    _0x16314b.id = "etqPagina";
    _0x16314b.textContent = "@page{size:" + _0x75a6c6 + "}";
    document.head.appendChild(_0x16314b);
    document.body.appendChild(_0x478680);
    document.body.classList.add("lote-imprimiendo");
    window.addEventListener("afterprint", __limpiarLote, {
      once: true
    });
    setTimeout(() => window.print(), 60);
  }
  function __limpiarLote() {
    ["etqLote", "etqPagina"].forEach(_0x52dc2b => {
      const _0x28f637 = document.getElementById(_0x52dc2b);
      if (_0x28f637) {
        _0x28f637.remove();
      }
    });
    document.body.classList.remove("lote-imprimiendo");
  }
  function __etqPintar(_0x422e35) {
    const _0xaec946 = __etqFormato();
    const _0x1e9315 = _0x1d1ab0;
    const _0x5b1490 = __etqTipo === "ref";
    const _0xf0834 = _0x5b1490 ? __etqSelRef : __etqSelUb;
    const _0x22d1f1 = [...new Set((estado.catalog || []).map(_0x3bb241 => (_0x3bb241.categoria || "").trim()).filter(Boolean))].sort((_0x5b3663, _0xa170bf) => _0x5b3663.localeCompare(_0xa170bf, "es"));
    _0x422e35.innerHTML = "<div class=\"clasif-seg clasif-vista\" style=\"margin-bottom:12px;\"><button type=\"button\" data-etq-tipo=\"ref\" class=\"" + (_0x5b1490 ? "on" : "") + "\">Referencias</button><button type=\"button\" data-etq-tipo=\"ub\" class=\"" + (_0x5b1490 ? "" : "on") + "\">Ubicaciones</button></div><label style=\"font-size:12px; color:var(--text-muted);\">Etiqueta (rollo de la Brother QL-700)</label><select id=\"etqFormato\" style=\"width:100%; margin:4px 0 12px;\">" + __ETQ_FORMATOS.map(_0x42f33f => "<option value=\"" + _0x42f33f.id + "\"" + (_0x42f33f.id === _0xaec946.id ? " selected" : "") + ">" + _0x1e9315(_0x42f33f.nombre) + "</option>").join("") + "</select>" + (_0x5b1490 ? "<div style=\"display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;\"><input type=\"text\" id=\"etqBuscar\" placeholder=\"Buscar por código, descripción o ubicación…\" style=\"flex:1 1 200px; min-width:0;\"><select id=\"etqCategoria\" style=\"flex:0 1 180px; min-width:0;\"><option value=\"\">Todas las categorías</option>" + _0x22d1f1.map(_0x29ca84 => "<option value=\"" + _0x1e9315(_0x29ca84) + "\">" + _0x1e9315(_0x29ca84) + "</option>").join("") + "</select></div>" : "<div style=\"display:flex; gap:8px; margin-bottom:8px;\"><input type=\"text\" id=\"etqNuevaUb\" placeholder=\"Otra ubicación (p. ej. A-12)\" style=\"flex:1; min-width:0;\"><button type=\"button\" class=\"cam-btn\" id=\"etqAnadirUb\" style=\"flex:none;\">Añadir</button></div>") + "<div style=\"display:flex; gap:8px; margin-bottom:8px;\"><button type=\"button\" class=\"cam-btn\" id=\"etqMarcar\" style=\"flex:1;\">Marcar las que se ven</button><button type=\"button\" class=\"cam-btn\" id=\"etqQuitar\" style=\"flex:1;\">Quitar marcas</button>" + (_0x5b1490 ? "<button type=\"button\" class=\"cam-btn\" id=\"etqSinEtq\" style=\"flex:1;\">Sin etiquetar</button>" : "") + "</div><div id=\"etqLista\" style=\"max-height:38vh; overflow:auto; border:1px solid var(--border); border-radius:8px; padding:0 10px;\"></div><p id=\"etqResumen\" style=\"font-size:12.5px; margin:10px 0 6px;\"></p><div style=\"display:flex; gap:8px;\"><button type=\"button\" class=\"cam-btn\" id=\"etqVistaBtn\" style=\"flex:1;\">Vista previa</button><button type=\"button\" class=\"btn primary\" id=\"etqImprimirBtn\" style=\"flex:1;\">Imprimir</button></div><div id=\"etqVista\" style=\"margin-top:12px; display:flex; flex-wrap:wrap; gap:10px; align-items:flex-start;\"></div><p style=\"font-size:12px; color:var(--text-faint); margin:12px 0 0;\">En el cuadro de impresión: impresora Brother QL-700, papel con el mismo tamaño que el rollo cargado, márgenes «Ninguno» y escala 100 %. La QL-700 se conecta por USB: imprimir desde un ordenador con el controlador instalado.</p>";
    const _0xfa54af = _0x422e35.querySelector("#etqLista");
    const _0xaa20b = _0x422e35.querySelector("#etqResumen");
    const _0x19ffee = () => {
      const _0x164337 = _0x5b1490 ? _0x422e35.querySelector("#etqBuscar").value.trim().toLowerCase() : "";
      const _0xb61896 = _0x5b1490 ? _0x422e35.querySelector("#etqCategoria").value : "";
      let _0x226292;
      if (_0x5b1490) {
        _0x226292 = (estado.catalog || []).filter(_0x5d1ec8 => _0x5d1ec8 && _0x5d1ec8.code && (!_0xb61896 || (_0x5d1ec8.categoria || "").trim() === _0xb61896) && (!_0x164337 || [_0x5d1ec8.code, _0x5d1ec8.desc, _0x5d1ec8.referencia, _0x5d1ec8.marca, _0x5d1ec8.location].some(_0x338dd4 => String(_0x338dd4 || "").toLowerCase().includes(_0x164337)))).map(_0x5bd23e => ({
          clave: _0x5bd23e.id,
          texto: _0x5bd23e.code,
          sub: _0x5bd23e.desc || "",
          ub: _0x5bd23e.location || ""
        }));
      } else {
        _0x226292 = __etqUbicaciones().map(_0x434d60 => ({
          clave: _0x434d60,
          texto: _0x434d60,
          sub: "",
          ub: ""
        }));
      }
      return _0x226292;
    };
    const _0x5549a3 = () => {
      let _0x44f87a = 0;
      _0xf0834.forEach(_0x2ce2f2 => {
        _0x44f87a += _0x2ce2f2;
      });
      _0xaa20b.textContent = _0x44f87a ? _0x44f87a + " etiqueta" + (_0x44f87a === 1 ? "" : "s") + " seleccionada" + (_0x44f87a === 1 ? "" : "s") + " (" + _0xaec946.nombre.split(" · ")[0] + ")." : "Marca lo que quieras imprimir.";
      _0x422e35.querySelector("#etqImprimirBtn").disabled = !_0x44f87a;
      _0x422e35.querySelector("#etqVistaBtn").disabled = !_0x44f87a;
    };
    const _0x28f48c = () => {
      const _0x4a5c03 = _0x19ffee();
      const _0x4d04be = _0x4a5c03.slice(0, 120);
      _0xfa54af.innerHTML = _0x4d04be.map(_0x258952 => {
        const _0x47a9cb = _0xf0834.get(_0x258952.clave);
        return "<div class=\"clasif-fila\"><label class=\"clasif-desc\" style=\"display:flex; gap:8px; align-items:center;\"><input type=\"checkbox\" data-etq-clave=\"" + _0x1e9315(_0x258952.clave) + "\"" + (_0x47a9cb ? " checked" : "") + " style=\"width:auto; margin:0; flex:none;\"><span>" + _0x1e9315(_0x258952.texto) + (_0x258952.sub ? "<br><small>" + _0x1e9315(__iaCorto(_0x258952.sub, 60)) + (_0x258952.ub ? " · " + _0x1e9315(_0x258952.ub) : "") + "</small>" : "") + "</span></label><input type=\"number\" min=\"1\" max=\"99\" value=\"" + (_0x47a9cb || 1) + "\" data-etq-copias=\"" + _0x1e9315(_0x258952.clave) + "\" style=\"width:64px;\" aria-label=\"Copias\"></div>";
      }).join("") + (_0x4a5c03.length > 120 ? "<p style=\"font-size:12px; color:var(--text-faint);\">Se muestran 120 de " + _0x4a5c03.length + ". Afina la búsqueda.</p>" : "") + (_0x4a5c03.length ? "" : "<p style=\"font-size:13px; color:var(--text-faint);\">" + (_0x5b1490 ? "No hay referencias con ese filtro." : "No hay ubicaciones. Se añaden desde el stock o aquí.") + "</p>");
      _0xfa54af.querySelectorAll("[data-etq-clave]").forEach(_0xa3ee3b => {
        _0xa3ee3b.addEventListener("change", () => {
          const _0x196306 = _0xa3ee3b.getAttribute("data-etq-clave");
          const _0x58fd7b = _0xfa54af.querySelector("[data-etq-copias=\"" + (window.CSS && CSS.escape ? CSS.escape(_0x196306) : _0x196306) + "\"]");
          if (_0xa3ee3b.checked) {
            _0xf0834.set(_0x196306, Math.min(99, Math.max(1, parseInt(_0x58fd7b.value, 10) || 1)));
          } else {
            _0xf0834.delete(_0x196306);
          }
          _0x5549a3();
        });
      });
      _0xfa54af.querySelectorAll("[data-etq-copias]").forEach(_0x32984c => {
        _0x32984c.addEventListener("change", () => {
          const _0x124fc2 = _0x32984c.getAttribute("data-etq-copias");
          const _0x1cdfed = Math.min(99, Math.max(1, parseInt(_0x32984c.value, 10) || 1));
          _0x32984c.value = _0x1cdfed;
          if (_0xf0834.has(_0x124fc2)) {
            _0xf0834.set(_0x124fc2, _0x1cdfed);
            _0x5549a3();
          }
        });
      });
      _0x5549a3();
    };
    _0x422e35.querySelectorAll("[data-etq-tipo]").forEach(_0x14eed6 => _0x14eed6.addEventListener("click", () => {
      __etqTipo = _0x14eed6.getAttribute("data-etq-tipo");
      __etqPintar(_0x422e35);
    }));
    _0x422e35.querySelector("#etqFormato").addEventListener("change", _0x2f100f => {
      __etqFormatoId = _0x2f100f.target.value;
      try {
        localStorage.setItem("tecnomat_etq_formato", __etqFormatoId);
      } catch (_0x5f2884) {}
      _0x5549a3();
      _0x422e35.querySelector("#etqVista").innerHTML = "";
    });
    if (_0x5b1490) {
      _0x422e35.querySelector("#etqBuscar").addEventListener("input", _0x28f48c);
      _0x422e35.querySelector("#etqCategoria").addEventListener("change", _0x28f48c);
    } else {
      _0x422e35.querySelector("#etqAnadirUb").addEventListener("click", () => {
        const _0x5587ca = _0x422e35.querySelector("#etqNuevaUb");
        const _0x465126 = _0x5587ca.value.trim().slice(0, 40);
        if (!_0x465126) {
          return;
        }
        if (!__etqExtra.includes(_0x465126)) {
          __etqExtra.push(_0x465126);
        }
        __etqSelUb.set(_0x465126, 1);
        __etqPintar(_0x422e35);
      });
    }
    _0x422e35.querySelector("#etqMarcar").addEventListener("click", () => {
      _0x19ffee().forEach(_0x182782 => {
        const _0x34bc9c = _0xfa54af.querySelector("[data-etq-copias=\"" + (window.CSS && CSS.escape ? CSS.escape(_0x182782.clave) : _0x182782.clave) + "\"]");
        _0xf0834.set(_0x182782.clave, _0x34bc9c ? Math.min(99, Math.max(1, parseInt(_0x34bc9c.value, 10) || 1)) : 1);
      });
      _0x28f48c();
    });
    _0x422e35.querySelector("#etqQuitar").addEventListener("click", () => {
      _0xf0834.clear();
      _0x28f48c();
    });
    if (_0x5b1490) {
      _0x422e35.querySelector("#etqSinEtq").addEventListener("click", () => {
        const _0x141420 = new Set(estado.settings.etqHechas || []);
        const _0x5733f1 = _0x19ffee().filter(_0xe52da5 => !_0x141420.has(_0xe52da5.clave));
        _0x5733f1.forEach(_0x1a086c => _0xf0834.set(_0x1a086c.clave, 1));
        _0x279f78(_0x5733f1.length ? _0x5733f1.length + " referencia" + (_0x5733f1.length === 1 ? "" : "s") + " sin etiquetar marcada" + (_0x5733f1.length === 1 ? "" : "s") + "." : "Todas las referencias de la lista ya tienen etiqueta impresa.");
        _0x28f48c();
      });
    }
    const _0x217252 = async () => {
      if (!(await __cargarBarras())) {
        _0x279f78("No se pudo cargar el generador de códigos de barras — revisa la conexión e inténtalo de nuevo.");
        return null;
      }
      const _0x43aac5 = __etqDatos();
      if (_0x43aac5.length > __ETQ_MAX) {
        _0x279f78("Máximo " + __ETQ_MAX + " etiquetas por impresión. Reduce la selección.");
        return null;
      }
      return _0x43aac5.map(_0x1a6fdf => __etqNodo(_0x1a6fdf, __etqFormato()));
    };
    _0x422e35.querySelector("#etqVistaBtn").addEventListener("click", async () => {
      const _0x9cfd98 = await _0x217252();
      if (!_0x9cfd98) {
        return;
      }
      const _0x180847 = _0x422e35.querySelector("#etqVista");
      _0x180847.innerHTML = "";
      _0x9cfd98.slice(0, 6).forEach(_0x5cfc0b => {
        _0x5cfc0b.style.outline = "1px dashed #888";
        _0x180847.appendChild(_0x5cfc0b);
      });
      if (_0x9cfd98.length > 6) {
        const _0x2fcd26 = document.createElement("p");
        _0x2fcd26.style.cssText = "font-size:12px; color:var(--text-faint); align-self:center;";
        _0x2fcd26.textContent = "… y " + (_0x9cfd98.length - 6) + " más.";
        _0x180847.appendChild(_0x2fcd26);
      }
    });
    _0x422e35.querySelector("#etqImprimirBtn").addEventListener("click", async () => {
      const _0x371e1e = await _0x217252();
      if (!_0x371e1e || !_0x371e1e.length) {
        return;
      }
      if (_0x371e1e.length > 50 && !(await _0x2cc777("Se van a imprimir " + _0x371e1e.length + " etiquetas. ¿Continuar?"))) {
        return;
      }
      const _0x3f0543 = document.createElement("div");
      _0x371e1e.forEach(_0x1f3640 => _0x3f0543.appendChild(_0x1f3640));
      const _0x45d1f4 = __etqFormato();
      if (_0x5b1490) {
        const _0x28973b = new Set((estado.catalog || []).map(_0x1ff500 => _0x1ff500.id));
        estado.settings.etqHechas = [...new Set([...(estado.settings.etqHechas || []), ...__etqSelRef.keys()])].filter(_0x58b13d => _0x28973b.has(_0x58b13d));
        guardar("settings", estado.settings);
      }
      __imprimirLote(_0x3f0543, _0x45d1f4.w + "mm " + _0x45d1f4.h + "mm; margin:0");
    });
    _0x28f48c();
  }
  function __etqFormatoRecordado() {
    try {
      const _0x510699 = localStorage.getItem("tecnomat_etq_formato");
      if (_0x510699 && __ETQ_FORMATOS.some(_0x35a558 => _0x35a558.id === _0x510699)) {
        __etqFormatoId = _0x510699;
      }
    } catch (_0x5ecb10) {}
  }
  async function __etiquetaRapida(_0x6744ca) {
    const _0x1a03a8 = (estado.catalog || []).find(_0x218bc6 => _0x218bc6.id === _0x6744ca);
    if (!_0x1a03a8 || !_0x1a03a8.code) {
      return;
    }
    if (!(await __cargarBarras())) {
      _0x279f78("No se pudo cargar el generador de códigos de barras — revisa la conexión e inténtalo de nuevo.");
      return;
    }
    __etqFormatoRecordado();
    const _0x46d3d7 = __etqFormato();
    __imprimirLote(__etqNodo({
      tipo: "ref",
      codigo: String(_0x1a03a8.code),
      titulo: String(_0x1a03a8.code),
      desc: _0x1a03a8.desc || "",
      ub: _0x1a03a8.location || ""
    }, _0x46d3d7), _0x46d3d7.w + "mm " + _0x46d3d7.h + "mm; margin:0");
  }
  async function __etqAbrir() {
    __etqFormatoRecordado();
    const _0x1ece10 = __herrOverlay("Etiquetas");
    __etqPintar(_0x1ece10);
    __cargarBarras();
  }
  function __pitido() {
    try {
      if (!estado.settings || estado.settings.sonidoEscaneo === false) {
        return;
      }
      const _0x4872a3 = window.AudioContext || window.webkitAudioContext;
      if (!_0x4872a3) {
        return;
      }
      const _0x2d07c1 = new _0x4872a3();
      const _0x3bb38e = _0x2d07c1.createOscillator();
      const _0x1273d9 = _0x2d07c1.createGain();
      _0x3bb38e.frequency.value = 1100;
      _0x1273d9.gain.value = 0.08;
      _0x3bb38e.connect(_0x1273d9);
      _0x1273d9.connect(_0x2d07c1.destination);
      _0x3bb38e.start();
      setTimeout(() => {
        _0x3bb38e.stop();
        _0x2d07c1.close();
      }, 110);
    } catch (_0x3db9e4) {}
  }
  async function __camaraContinua(_0x161e02) {
    if (!("BarcodeDetector" in window) || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      _0x279f78("Este navegador no admite lectura con cámara. Usa un lector USB/Bluetooth o escribe el código.");
      return null;
    }
    if (__camaraActiva) {
      __camaraActiva.cerrar();
    }
    let _0x2c434b;
    try {
      _0x2c434b = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment"
        }
      });
    } catch (_0x58f630) {
      _0x279f78("No se pudo abrir la cámara: " + (_0x58f630 && _0x58f630.message ? _0x58f630.message : "permiso denegado") + ".");
      return null;
    }
    const _0x577a9a = document.createElement("div");
    _0x577a9a.id = "herrCamara";
    _0x577a9a.innerHTML = "<video autoplay playsinline muted></video><p id=\"herrCamaraEstado\">Apunta al código. La cámara sigue abierta hasta cerrarla.</p>";
    const _0x386dcc = _0x577a9a.querySelector("video");
    _0x386dcc.srcObject = _0x2c434b;
    const _0x4ce00b = __herrBoton("herrCamaraCerrar", "Cerrar cámara", "btn primary");
    _0x577a9a.appendChild(_0x4ce00b);
    document.body.appendChild(_0x577a9a);
    const _0x30f16a = new BarcodeDetector({
      formats: ["code_128", "ean_13", "ean_8", "code_39", "upc_a", "upc_e", "itf", "qr_code"]
    });
    let _0x34330a = true;
    let _0x51bc52 = "";
    let _0x5c0983 = 0;
    const _0x4e058b = async () => {
      if (!_0x34330a) {
        return;
      }
      try {
        const _0x49cccf = await _0x30f16a.detect(_0x386dcc);
        const _0x405b33 = Date.now();
        if (_0x49cccf && _0x49cccf.length) {
          const _0x33dd17 = String(_0x49cccf[0].rawValue || "").trim();
          if (_0x33dd17 && (_0x33dd17 !== _0x51bc52 || _0x405b33 - _0x5c0983 > 2500)) {
            _0x51bc52 = _0x33dd17;
            _0x5c0983 = _0x405b33;
            __pitido();
            const _0x548b57 = _0x577a9a.querySelector("#herrCamaraEstado");
            if (_0x548b57) {
              _0x548b57.textContent = _0x33dd17;
            }
            _0x161e02(_0x33dd17);
          }
        }
      } catch (_0x11c89f) {}
      if (_0x34330a) {
        setTimeout(_0x4e058b, 250);
      }
    };
    const _0x430cf8 = {
      cerrar: () => {
        if (!_0x34330a) {
          return;
        }
        _0x34330a = false;
        _0x2c434b.getTracks().forEach(_0x4a36f0 => _0x4a36f0.stop());
        _0x577a9a.remove();
        if (__camaraActiva === _0x430cf8) {
          __camaraActiva = null;
        }
      }
    };
    _0x4ce00b.addEventListener("click", _0x430cf8.cerrar);
    __camaraActiva = _0x430cf8;
    _0x4e058b();
    return _0x430cf8;
  }
  const __INV_SIN = "__sin";
  let __invUb = "";
  let __invFilas = [];
  let __invFase = "elegir";
  function __invNombreUb() {
    if (__invUb === __INV_SIN) {
      return "Sin ubicación";
    } else {
      return __invUb;
    }
  }
  function __invCargar(_0x88a8b3) {
    __invUb = _0x88a8b3;
    __invFilas = (estado.catalog || []).filter(_0x5b4577 => _0x5b4577 && (_0x88a8b3 === __INV_SIN && !String(_0x5b4577.location || "").trim() || _0x88a8b3 !== __INV_SIN && String(_0x5b4577.location || "").trim().toLowerCase() === _0x88a8b3.toLowerCase())).sort((_0x16f834, _0x361a4a) => String(_0x16f834.code).localeCompare(String(_0x361a4a.code), "es", {
      numeric: true
    })).map(_0x208310 => ({
      id: _0x208310.id,
      cont: null
    }));
    __invFase = "contar";
  }
  function __invElegirDeTexto(_0x52170c) {
    const _0x55c254 = String(_0x52170c || "").trim();
    if (!_0x55c254) {
      return "";
    }
    const _0x2d8e80 = /^ub-/i.test(_0x55c254) ? _0x55c254.slice(3) : _0x55c254;
    return __etqUbicaciones().find(_0xfc307a => _0xfc307a.toLowerCase() === _0x2d8e80.toLowerCase()) || "";
  }
  function __invAbrir() {
    __invFase = "elegir";
    __invUb = "";
    __invFilas = [];
    const _0x55be47 = __herrOverlay("Inventario guiado");
    __invPintar(_0x55be47);
  }
  function __invPintar(_0x38e52b) {
    if (__invFase === "elegir") {
      __invPintarElegir(_0x38e52b);
    } else if (__invFase === "contar") {
      __invPintarContar(_0x38e52b);
    } else {
      __invPintarRevisar(_0x38e52b);
    }
  }
  function __invPintarElegir(_0x26fac5) {
    const _0x40834e = _0x1d1ab0;
    const _0x12e959 = __etqUbicaciones();
    _0x26fac5.innerHTML = "<p style=\"font-size:13px; margin:0 0 10px;\">Se cuenta una ubicación cada vez. Escanear la etiqueta de la ubicación (o elegirla de la lista) y después escanear cada material: cada lectura suma 1.</p><select id=\"invUb\" style=\"width:100%; margin-bottom:8px;\"><option value=\"\">Elegir ubicación…</option>" + _0x12e959.map(_0x22a71b => "<option value=\"" + _0x40834e(_0x22a71b) + "\">" + _0x40834e(_0x22a71b) + "</option>").join("") + "<option value=\"" + __INV_SIN + "\">(Sin ubicación)</option></select><div style=\"display:flex; gap:8px; margin-bottom:12px;\"><input type=\"text\" id=\"invUbCodigo\" placeholder=\"Escanear o escribir la ubicación\" style=\"flex:1; min-width:0;\" autocomplete=\"off\"><button type=\"button\" class=\"cam-btn\" id=\"invUbCam\" style=\"flex:none;\">Cámara</button></div><button type=\"button\" class=\"btn primary\" id=\"invEmpezar\" style=\"width:100%;\">Empezar a contar</button>";
    const _0xbfe2ec = _0x26fac5.querySelector("#invUb");
    const _0x15e7db = _0x26fac5.querySelector("#invUbCodigo");
    const _0xc3b18c = () => {
      if (!_0xbfe2ec.value) {
        _0x279f78("Elige una ubicación.");
        return;
      }
      __invCargar(_0xbfe2ec.value);
      if (!__invFilas.length) {
        _0x279f78("No hay material en esa ubicación.");
        __invFase = "elegir";
        return;
      }
      __invPintar(_0x26fac5);
    };
    const _0x251b14 = _0x688a3b => {
      const _0xc09546 = __invElegirDeTexto(_0x688a3b);
      if (!_0xc09546) {
        _0x279f78("No se reconoce esa ubicación: " + String(_0x688a3b).trim() + ".");
        return false;
      }
      _0xbfe2ec.value = _0xc09546;
      return true;
    };
    _0x15e7db.addEventListener("keydown", _0x400241 => {
      if (_0x400241.key === "Enter") {
        _0x400241.preventDefault();
        if (_0x251b14(_0x15e7db.value)) {
          _0x15e7db.value = "";
          _0xc3b18c();
        }
      }
    });
    _0x26fac5.querySelector("#invUbCam").addEventListener("click", async () => {
      await __camaraContinua(_0x356f95 => {
        if (_0x251b14(_0x356f95)) {
          if (__camaraActiva) {
            __camaraActiva.cerrar();
          }
          _0xc3b18c();
        }
      });
    });
    _0x26fac5.querySelector("#invEmpezar").addEventListener("click", _0xc3b18c);
    _0x15e7db.focus();
  }
  function __invItem(_0x56a380) {
    return (estado.catalog || []).find(_0x310206 => _0x310206.id === _0x56a380) || null;
  }
  function __invLeer(_0x39bc7f, _0x3d285a) {
    const _0x153afd = String(_0x39bc7f || "").trim();
    if (!_0x153afd) {
      return;
    }
    if (/^ub-/i.test(_0x153afd)) {
      _0x279f78("Esa es una etiqueta de ubicación. Para cambiar de ubicación, vuelve atrás.");
      return;
    }
    const _0x37f389 = __invFilas.filter(_0x1eab21 => {
      const _0x29c1d6 = __invItem(_0x1eab21.id);
      return _0x29c1d6 && String(_0x29c1d6.code).toLowerCase() === _0x153afd.toLowerCase();
    });
    if (!_0x37f389.length) {
      const _0x3dc2ed = (estado.catalog || []).find(_0x271fb8 => _0x271fb8 && String(_0x271fb8.code).toLowerCase() === _0x153afd.toLowerCase());
      _0x279f78(_0x3dc2ed ? "«" + _0x153afd + "» está registrado en «" + (String(_0x3dc2ed.location || "").trim() || "sin ubicación") + "», no aquí." : "«" + _0x153afd + "» no existe en el stock.");
      return;
    }
    const _0x3b744c = _0x37f389.find(_0x4c3e6a => _0x4c3e6a.cont === null) || _0x37f389[0];
    _0x3b744c.cont = (_0x3b744c.cont || 0) + 1;
    __pitido();
    __invRepintarLista(_0x3d285a);
  }
  function __invRepintarLista(_0x52494e) {
    const _0xd02120 = _0x52494e.querySelector("#invLista");
    if (!_0xd02120) {
      return;
    }
    const _0x170915 = _0x1d1ab0;
    _0xd02120.innerHTML = __invFilas.map((_0x228e18, _0x31d3fd) => {
      const _0x403f8a = __invItem(_0x228e18.id);
      if (!_0x403f8a) {
        return "";
      }
      const _0xac3991 = _0x228e18.cont === null ? null : _0x228e18.cont - (parseInt(_0x403f8a.qty, 10) || 0);
      return "<div class=\"clasif-fila\"><span class=\"clasif-desc\">" + _0x170915(_0x403f8a.code) + "<br><small>" + _0x170915(__iaCorto(_0x403f8a.desc || "", 60)) + " · sistema: " + _0x170915(_0x403f8a.qty) + "</small></span><div class=\"clasif-seg\"><button type=\"button\" data-inv-menos=\"" + _0x31d3fd + "\">−</button><input type=\"number\" min=\"0\" data-inv-cont=\"" + _0x31d3fd + "\" value=\"" + (_0x228e18.cont === null ? "" : _0x228e18.cont) + "\" placeholder=\"—\" style=\"width:64px;\" aria-label=\"Contado\"><button type=\"button\" data-inv-mas=\"" + _0x31d3fd + "\">+</button></div>" + (_0xac3991 === null ? "" : "<span class=\"clasif-tag\" style=\"" + (_0xac3991 === 0 ? "" : "border-color:#d9534f; color:#d9534f;") + "\">" + (_0xac3991 === 0 ? "OK" : (_0xac3991 > 0 ? "+" : "") + _0xac3991) + "</span>") + "</div>";
    }).join("");
    _0xd02120.querySelectorAll("[data-inv-mas]").forEach(_0x24153c => _0x24153c.addEventListener("click", () => {
      const _0x42f4c2 = __invFilas[+_0x24153c.getAttribute("data-inv-mas")];
      _0x42f4c2.cont = (_0x42f4c2.cont || 0) + 1;
      __invRepintarLista(_0x52494e);
    }));
    _0xd02120.querySelectorAll("[data-inv-menos]").forEach(_0x4a797a => _0x4a797a.addEventListener("click", () => {
      const _0x3acade = __invFilas[+_0x4a797a.getAttribute("data-inv-menos")];
      _0x3acade.cont = Math.max(0, (_0x3acade.cont === null ? 1 : _0x3acade.cont) - 1);
      __invRepintarLista(_0x52494e);
    }));
    _0xd02120.querySelectorAll("[data-inv-cont]").forEach(_0x352448 => _0x352448.addEventListener("change", () => {
      const _0x1418e0 = __invFilas[+_0x352448.getAttribute("data-inv-cont")];
      const _0x5d9022 = _0x352448.value.trim();
      _0x1418e0.cont = _0x5d9022 === "" ? null : Math.max(0, parseInt(_0x5d9022, 10) || 0);
      __invRepintarLista(_0x52494e);
    }));
    const _0xfc4635 = __invFilas.filter(_0x318d68 => _0x318d68.cont !== null).length;
    const _0x3a857c = _0x52494e.querySelector("#invProgreso");
    if (_0x3a857c) {
      _0x3a857c.textContent = "Contadas " + _0xfc4635 + " de " + __invFilas.length;
    }
    const _0x479e58 = _0x52494e.querySelector("#invRevisar");
    if (_0x479e58) {
      _0x479e58.disabled = !_0xfc4635;
    }
  }
  function __invPintarContar(_0x170e28) {
    _0x170e28.innerHTML = "<p style=\"margin:0 0 4px;\"><strong>" + _0x1d1ab0(__invNombreUb()) + "</strong> · <span id=\"invProgreso\"></span></p><div style=\"display:flex; gap:8px; margin:8px 0;\"><input type=\"text\" id=\"invEscaner\" placeholder=\"Escanea o escribe un código y pulsa Enter\" style=\"flex:1; min-width:0;\" autocomplete=\"off\"><button type=\"button\" class=\"cam-btn\" id=\"invCam\" style=\"flex:none;\">Cámara</button></div><div id=\"invLista\" style=\"max-height:44vh; overflow:auto; border:1px solid var(--border); border-radius:8px; padding:0 10px;\"></div><div style=\"display:flex; gap:8px; margin-top:12px;\"><button type=\"button\" class=\"cam-btn\" id=\"invOtra\" style=\"flex:1;\">Cambiar ubicación</button><button type=\"button\" class=\"btn primary\" id=\"invRevisar\" style=\"flex:1;\">Revisar diferencias</button></div><p style=\"font-size:12px; color:var(--text-faint); margin:10px 0 0;\">Lo que no se cuenta no se modifica. Hasta aplicar los ajustes no cambia el stock.</p>";
    const _0x77cd37 = _0x170e28.querySelector("#invEscaner");
    _0x77cd37.addEventListener("keydown", _0x5c14c0 => {
      if (_0x5c14c0.key !== "Enter") {
        return;
      }
      _0x5c14c0.preventDefault();
      __invLeer(_0x77cd37.value, _0x170e28);
      _0x77cd37.value = "";
      _0x77cd37.focus();
    });
    _0x170e28.querySelector("#invCam").addEventListener("click", () => __camaraContinua(_0x323a41 => __invLeer(_0x323a41, _0x170e28)));
    _0x170e28.querySelector("#invOtra").addEventListener("click", async () => {
      if (__invFilas.some(_0x1543b6 => _0x1543b6.cont !== null) && !(await _0x2cc777("Hay material contado sin aplicar. ¿Descartar el recuento de esta ubicación?"))) {
        return;
      }
      __invFase = "elegir";
      __invPintar(_0x170e28);
    });
    _0x170e28.querySelector("#invRevisar").addEventListener("click", () => {
      __invFase = "revisar";
      __invPintar(_0x170e28);
    });
    __invRepintarLista(_0x170e28);
    _0x77cd37.focus();
  }
  function __invDiferencias() {
    return __invFilas.map(_0x1cfdc1 => {
      const _0x4d4bd2 = __invItem(_0x1cfdc1.id);
      if (_0x4d4bd2 && _0x1cfdc1.cont !== null) {
        return {
          item: _0x4d4bd2,
          cont: _0x1cfdc1.cont,
          sist: parseInt(_0x4d4bd2.qty, 10) || 0
        };
      } else {
        return null;
      }
    }).filter(_0x5d67c1 => _0x5d67c1 && _0x5d67c1.cont !== _0x5d67c1.sist);
  }
  function __invPintarRevisar(_0x4e5082) {
    const _0x44c4f4 = _0x1d1ab0;
    const _0x3a424b = __invDiferencias();
    const _0x420915 = __invFilas.filter(_0x2145ff => _0x2145ff.cont === null).length;
    _0x4e5082.innerHTML = "<p style=\"margin:0 0 8px;\"><strong>" + _0x44c4f4(__invNombreUb()) + "</strong> · diferencias</p>" + (_0x3a424b.length ? _0x3a424b.map(_0x4d8db7 => "<div class=\"clasif-fila\"><span class=\"clasif-desc\">" + _0x44c4f4(_0x4d8db7.item.code) + "<br><small>" + _0x44c4f4(__iaCorto(_0x4d8db7.item.desc || "", 60)) + "</small></span><span>" + _0x4d8db7.sist + " → <strong>" + _0x4d8db7.cont + "</strong> (" + (_0x4d8db7.cont > _0x4d8db7.sist ? "+" : "") + (_0x4d8db7.cont - _0x4d8db7.sist) + ")</span></div>").join("") : "<p style=\"font-size:13.5px; color:var(--text-faint);\">Todo lo contado coincide con el stock.</p>") + (_0x420915 ? "<p style=\"font-size:12.5px; color:var(--text-faint); margin:10px 0 0;\">" + _0x420915 + " referencia" + (_0x420915 === 1 ? "" : "s") + " sin contar: no se modifican.</p>" : "") + "<div style=\"display:flex; gap:8px; margin-top:12px;\"><button type=\"button\" class=\"cam-btn\" id=\"invVolver\" style=\"flex:1;\">Seguir contando</button>" + (_0x3a424b.length ? "<button type=\"button\" class=\"btn primary\" id=\"invAplicar\" style=\"flex:1;\">Aplicar " + _0x3a424b.length + " ajuste" + (_0x3a424b.length === 1 ? "" : "s") + "</button>" : "<button type=\"button\" class=\"btn primary\" id=\"invTerminar\" style=\"flex:1;\">Terminar</button>") + "</div>";
    _0x4e5082.querySelector("#invVolver").addEventListener("click", () => {
      __invFase = "contar";
      __invPintar(_0x4e5082);
    });
    const _0x32754c = _0x4e5082.querySelector("#invTerminar");
    if (_0x32754c) {
      _0x32754c.addEventListener("click", () => {
        __invFase = "elegir";
        __invPintar(_0x4e5082);
      });
    }
    const _0x57d725 = _0x4e5082.querySelector("#invAplicar");
    if (_0x57d725) {
      _0x57d725.addEventListener("click", async () => {
        if (!(await _0x2cc777("Aplicar " + _0x3a424b.length + " ajuste(s) de inventario en «" + __invNombreUb() + "»? Quedan registrados como movimientos."))) {
          return;
        }
        let _0x317f6e = 0;
        _0x3a424b.forEach(_0x5680f1 => {
          const _0x482daf = parseInt(_0x5680f1.item.qty, 10) || 0;
          const _0x375497 = _0x5680f1.cont - _0x482daf;
          if (!_0x375497) {
            return;
          }
          _0x1d4277(_0x5680f1.item, Math.abs(_0x375497), _0x375497 > 0 ? "entrada" : "salida", "Ajuste de inventario — " + __invNombreUb());
          _0x317f6e++;
        });
        _0x279f78("Inventario aplicado: " + _0x317f6e + " ajuste" + (_0x317f6e === 1 ? "" : "s") + ".");
        __invFase = "elegir";
        render();
        __invPintar(_0x4e5082);
      });
    }
  }
  function __modoDisponible(_0x2d391b) {
    const _0x582b0d = _0x2d391b === "montaje" || _0x2d391b === "proyecto" ? "trabajo" : _0x2d391b;
    return !!document.querySelector(".mode-btn[data-mode=\"" + _0x582b0d + "\"]");
  }
  function __buscarTodo(_0x66c935) {
    const _0x4a56b6 = String(_0x66c935 || "").trim().toLowerCase();
    const _0xa1f4f7 = {
      stock: [],
      ordenes: [],
      trabajadores: []
    };
    if (_0x4a56b6.length < 2) {
      return _0xa1f4f7;
    }
    const _0x2ae208 = _0x2173d8 => String(_0x2173d8 || "").toLowerCase().includes(_0x4a56b6);
    (estado.catalog || []).forEach(_0x20176d => {
      if (_0x20176d && [_0x20176d.code, _0x20176d.desc, _0x20176d.referencia, _0x20176d.marca, _0x20176d.location].some(_0x2ae208)) {
        _0xa1f4f7.stock.push(_0x20176d);
      }
    });
    const _0x4bf172 = estado.groupData || {};
    Object.keys(_0x4bf172).forEach(_0x4a6d0a => {
      const _0x2422bb = _0x4bf172[_0x4a6d0a];
      if (!_0x2422bb) {
        return;
      }
      const _0x3c1834 = _0x4a6d0a.indexOf("::");
      const _0x1b3d8c = _0x4a6d0a.slice(0, _0x3c1834);
      const _0x3f1b29 = _0x4a6d0a.slice(_0x3c1834 + 2);
      const _0x59f39e = [].concat(_0x2422bb.pendiente && _0x2422bb.pendiente.items || [], _0x2422bb.servido || [], _0x2422bb.devuelto || []);
      const _0x433e7f = _0x2ae208(_0x3f1b29) ? "nombre" : _0x59f39e.some(_0x2263ad => [_0x2263ad.code, _0x2263ad.desc, _0x2263ad.text, _0x2263ad.texto].some(_0x2ae208)) ? "material" : "";
      if (_0x433e7f) {
        _0xa1f4f7.ordenes.push({
          modo: _0x1b3d8c,
          nombre: _0x3f1b29,
          por: _0x433e7f
        });
      }
    });
    (estado.trabajadores || []).forEach(_0x5bd109 => {
      if (_0x2ae208(_0x5bd109.nombre)) {
        _0xa1f4f7.trabajadores.push(_0x5bd109);
      }
    });
    return _0xa1f4f7;
  }
  function __irA(_0x42e678, _0x45ea9f) {
    estado.mode = _0x42e678;
    if (_0x45ea9f) {
      _0x45ea9f();
    }
    render();
  }
  function __busquedaPintar(_0x234cf6, _0x1216fd) {
    const _0x35cb88 = _0x1d1ab0;
    const _0x195629 = _0x234cf6.querySelector("#busquedaRes");
    const _0x374d7a = __buscarTodo(_0x1216fd);
    const _0x425e90 = _0x374d7a.stock.length + _0x374d7a.ordenes.length + _0x374d7a.trabajadores.length;
    if (String(_0x1216fd || "").trim().length < 2) {
      _0x195629.innerHTML = "";
      return;
    }
    if (!_0x425e90) {
      _0x195629.innerHTML = "<p style=\"font-size:13px; color:var(--text-faint); margin:8px 0 0;\">Sin resultados.</p>";
      return;
    }
    const _0x57d1fa = (_0x3f4f78, _0x4ac01c, _0x3f5a2a, _0x4fc08d) => "<div class=\"clasif-fila\"><span class=\"clasif-desc\">" + _0x35cb88(_0x3f4f78) + (_0x4ac01c ? "<br><small>" + _0x35cb88(_0x4ac01c) + "</small>" : "") + "</span>" + (_0x4fc08d ? "<div class=\"clasif-seg\"><button type=\"button\" " + _0x3f5a2a + ">Ver</button></div>" : "") + "</div>";
    const _0x3e8c24 = (_0xe10779, _0x38899f) => _0x38899f ? "<p class=\"panel-title\" style=\"font-size:13px; margin:12px 0 0;\">" + _0xe10779 + "</p>" + _0x38899f : "";
    _0x195629.innerHTML = _0x3e8c24("Stock (" + _0x374d7a.stock.length + ")", _0x374d7a.stock.slice(0, 8).map(_0xbe0ef2 => _0x57d1fa(_0xbe0ef2.code + " · " + (_0xbe0ef2.desc || ""), "Ub. " + (_0xbe0ef2.location || "—") + " · " + _0xbe0ef2.qty + " uds", "data-bus-stock=\"" + _0x35cb88(_0xbe0ef2.code) + "\"", __modoDisponible("almacen"))).join("") + (_0x374d7a.stock.length > 8 ? "<p style=\"font-size:12px; color:var(--text-faint);\">Hay más. Afina la búsqueda.</p>" : "")) + _0x3e8c24("Órdenes y proyectos (" + _0x374d7a.ordenes.length + ")", _0x374d7a.ordenes.slice(0, 8).map(_0x1c52d9 => _0x57d1fa(_0x1c52d9.nombre, (_0x1c52d9.modo === "proyecto" ? "Proyecto" : "Orden") + (_0x1c52d9.por === "material" ? " · por material pedido" : ""), "data-bus-orden=\"" + _0x35cb88(_0x1c52d9.modo + "::" + _0x1c52d9.nombre) + "\"", __modoDisponible(_0x1c52d9.modo))).join("")) + _0x3e8c24("Trabajadores (" + _0x374d7a.trabajadores.length + ")", _0x374d7a.trabajadores.slice(0, 8).map(_0x2d703c => _0x57d1fa(_0x2d703c.nombre, (_0x2d703c.ropa || []).length + " prenda(s) en la ficha", "data-bus-trab=\"" + _0x35cb88(_0x2d703c.id) + "\"", __modoDisponible("trabajadores"))).join(""));
    _0x195629.querySelectorAll("[data-bus-stock]").forEach(_0x2d0eec => _0x2d0eec.addEventListener("click", () => {
      const _0x3ba73e = _0x2d0eec.getAttribute("data-bus-stock");
      __irA("almacen");
      const _0x590556 = document.getElementById("globalStockSearch");
      if (_0x590556) {
        _0x590556.value = _0x3ba73e;
        _0x590556.dispatchEvent(new Event("input", {
          bubbles: true
        }));
      }
    }));
    _0x195629.querySelectorAll("[data-bus-orden]").forEach(_0x33b2c0 => _0x33b2c0.addEventListener("click", () => {
      const _0x10e9db = _0x33b2c0.getAttribute("data-bus-orden");
      const _0xce7b3c = _0x10e9db.indexOf("::");
      __irA(_0x10e9db.slice(0, _0xce7b3c), () => {
        estado.current[_0x10e9db.slice(0, _0xce7b3c)] = _0x10e9db.slice(_0xce7b3c + 2);
      });
    }));
    _0x195629.querySelectorAll("[data-bus-trab]").forEach(_0x5207c5 => _0x5207c5.addEventListener("click", () => {
      __irA("trabajadores", () => {
        __trabajadorActualId = _0x5207c5.getAttribute("data-bus-trab");
      });
    }));
  }
  function __busquedaPanel() {
    const _0x2c261d = document.getElementById("busquedaPanel");
    if (_0x2c261d) {
      _0x2c261d.remove();
    }
    if (estado.mode !== "resumen") {
      return;
    }
    const _0x544505 = document.getElementById("mainList");
    if (!_0x544505) {
      return;
    }
    const _0x3cb6d1 = document.createElement("div");
    _0x3cb6d1.className = "panel";
    _0x3cb6d1.id = "busquedaPanel";
    _0x3cb6d1.style.marginBottom = "14px";
    _0x3cb6d1.innerHTML = "<p class=\"panel-title\">Buscar</p><input type=\"text\" id=\"busquedaInput\" placeholder=\"Stock, órdenes, proyectos o trabajadores…\" style=\"width:100%;\" autocomplete=\"off\"><div id=\"busquedaRes\"></div>";
    _0x544505.insertBefore(_0x3cb6d1, _0x544505.firstChild);
    const _0x3c500b = _0x3cb6d1.querySelector("#busquedaInput");
    _0x3c500b.value = __busquedaTexto;
    _0x3c500b.addEventListener("input", () => {
      __busquedaTexto = _0x3c500b.value;
      __busquedaPintar(_0x3cb6d1, _0x3c500b.value);
    });
    __busquedaPintar(_0x3cb6d1, __busquedaTexto);
  }
  let __busquedaTexto = "";
  function __herramientasPanel() {
    const _0x4299f6 = document.getElementById("herrPanel");
    if (_0x4299f6) {
      _0x4299f6.remove();
    }
    if (estado.mode !== "almacen" || _0x2df77d() !== "almacen") {
      return;
    }
    const _0x35c1cf = document.getElementById("mainList");
    if (!_0x35c1cf) {
      return;
    }
    const _0x24d247 = document.createElement("div");
    _0x24d247.className = "panel";
    _0x24d247.id = "herrPanel";
    _0x24d247.style.marginBottom = "14px";
    _0x24d247.innerHTML = "<p class=\"panel-title\">Herramientas</p><div style=\"display:flex; gap:8px; flex-wrap:wrap;\"><button type=\"button\" class=\"btn\" id=\"herrEtqBtn\" style=\"flex:1 1 160px;\">Etiquetas</button><button type=\"button\" class=\"btn\" id=\"herrInvBtn\" style=\"flex:1 1 160px;\">Inventario guiado</button><button type=\"button\" class=\"btn\" id=\"herrMinBtn\" style=\"flex:1 1 160px;\">Mínimos automáticos</button></div><label style=\"display:flex; gap:8px; align-items:center; margin-top:10px; font-size:12.5px;\"><input type=\"checkbox\" id=\"herrSonido\" style=\"width:auto; margin:0;\"" + (estado.settings.sonidoEscaneo === false ? "" : " checked") + ">Pitido al leer un código (cámara continua e inventario)</label>";
    _0x35c1cf.insertBefore(_0x24d247, _0x35c1cf.firstChild);
    _0x24d247.querySelector("#herrEtqBtn").addEventListener("click", __etqAbrir);
    _0x24d247.querySelector("#herrInvBtn").addEventListener("click", __invAbrir);
    _0x24d247.querySelector("#herrMinBtn").addEventListener("click", __minAbrir);
    _0x24d247.querySelector("#herrSonido").addEventListener("change", _0x1766df => {
      estado.settings.sonidoEscaneo = _0x1766df.target.checked;
      guardar("settings", estado.settings);
    });
  }
  const __MIN_DIAS = 90;
  const __MIN_COBERTURA = 14;
  const __MIN_SALIDAS = 3;
  function __minSugerencias() {
    const _0x1d2fa4 = Date.now() - __MIN_DIAS * 86400000;
    const _0x2e8c0a = new Map();
    const _0x7aac69 = new Map();
    (estado.movements || []).forEach(_0x31d21e => {
      if (_0x31d21e.type !== "salida" || !(_0x31d21e.tsMs >= _0x1d2fa4)) {
        return;
      }
      _0x2e8c0a.set(_0x31d21e.code, (_0x2e8c0a.get(_0x31d21e.code) || 0) + _0x31d21e.qty);
      _0x7aac69.set(_0x31d21e.code, (_0x7aac69.get(_0x31d21e.code) || 0) + 1);
    });
    const _0x306963 = [];
    (estado.catalog || []).forEach(_0xe82247 => {
      if ((_0x7aac69.get(_0xe82247.code) || 0) < __MIN_SALIDAS) {
        return;
      }
      const _0x36cbbd = Math.max(1, Math.ceil(_0x2e8c0a.get(_0xe82247.code) / __MIN_DIAS * __MIN_COBERTURA));
      const _0xe5a93c = __clasifMinimo(_0xe82247);
      if (_0x36cbbd !== _0xe5a93c) {
        _0x306963.push({
          c: _0xe82247,
          act: _0xe5a93c,
          sug: _0x36cbbd
        });
      }
    });
    return _0x306963.sort((_0x185cfc, _0xd67a2c) => Math.abs(_0xd67a2c.sug - _0xd67a2c.act) - Math.abs(_0x185cfc.sug - _0x185cfc.act));
  }
  function __minAbrir() {
    const _0x1abb54 = __herrOverlay("Mínimos automáticos");
    const _0x28b2c1 = _0x1d1ab0;
    const _0x46d002 = __minSugerencias().slice(0, 100);
    if (!_0x46d002.length) {
      _0x1abb54.innerHTML = "<p style=\"font-size:13px;\">No hay propuestas: los mínimos actuales ya cubren el consumo de los últimos " + __MIN_DIAS + " días o aún hay pocas salidas registradas.</p>";
      return;
    }
    _0x1abb54.innerHTML = "<p style=\"font-size:13px; margin:0 0 10px;\">Propuesta basada en las salidas de los últimos " + __MIN_DIAS + " días: el mínimo cubre " + __MIN_COBERTURA + " días de consumo. Solo se listan referencias con " + __MIN_SALIDAS + " o más salidas.</p><div id=\"minLista\" style=\"max-height:44vh; overflow:auto; border:1px solid var(--border); border-radius:8px; padding:0 10px;\">" + _0x46d002.map((_0x6c4f82, _0x15c36d) => "<div class=\"clasif-fila\"><label class=\"clasif-desc\" style=\"display:flex; gap:8px; align-items:center;\"><input type=\"checkbox\" data-min-i=\"" + _0x15c36d + "\" checked style=\"width:auto; margin:0; flex:none;\"><span><b>" + _0x28b2c1(_0x6c4f82.c.code) + "</b> " + _0x28b2c1(_0x6c4f82.c.desc || "") + "</span></label><span style=\"white-space:nowrap; font-size:12.5px;\">" + _0x6c4f82.act + " → <b>" + _0x6c4f82.sug + "</b></span></div>").join("") + "</div><button type=\"button\" class=\"btn primary\" id=\"minAplicar\" style=\"width:100%; margin-top:12px;\">Aplicar seleccionados</button>";
    _0x1abb54.querySelector("#minAplicar").addEventListener("click", () => {
      let _0x22aef7 = 0;
      _0x1abb54.querySelectorAll("[data-min-i]").forEach(_0x58f657 => {
        if (!_0x58f657.checked) {
          return;
        }
        const _0x35f3b7 = _0x46d002[parseInt(_0x58f657.getAttribute("data-min-i"), 10)];
        _0x35f3b7.c.minimo = _0x35f3b7.sug;
        _0x22aef7++;
      });
      if (_0x22aef7) {
        guardarCatalogo();
      }
      if (__herrCierre) {
        __herrCierre();
      }
      _0x279f78(_0x22aef7 ? "Mínimo actualizado en " + _0x22aef7 + " referencia" + (_0x22aef7 === 1 ? "" : "s") + "." : "No se ha cambiado ningún mínimo.");
      render();
    });
  }
  function __ropaMeses() {
    const _0x5c5b7c = parseInt((estado.settings || {}).ropaMeses, 10);
    if (_0x5c5b7c > 0) {
      return _0x5c5b7c;
    } else {
      return 12;
    }
  }
  function __ropaUltima(_0x27718f, _0x34af72) {
    let _0x2f4a56 = 0;
    (_0x27718f.entregas || []).forEach(_0x3742cd => _0x3742cd.lineas.forEach(_0x2c554b => {
      if (_0x2c554b.itemId === _0x34af72 && _0x3742cd.ts > _0x2f4a56) {
        _0x2f4a56 = _0x3742cd.ts;
      }
    }));
    return _0x2f4a56;
  }
  function __ropaVence(_0x31dbc2, _0x1d2279) {
    const _0x9475ea = __ropaUltima(_0x31dbc2, _0x1d2279);
    if (!_0x9475ea) {
      return 0;
    }
    const _0x42c447 = new Date(_0x9475ea);
    _0x42c447.setMonth(_0x42c447.getMonth() + __ropaMeses());
    return _0x42c447.getTime();
  }
  function __ropaRenovaciones() {
    const _0x158dcb = [];
    (estado.trabajadores || []).forEach(_0x3e6a9a => (_0x3e6a9a.ropa || []).forEach(_0x5716bd => {
      const _0x4a3ece = __ropaVence(_0x3e6a9a, _0x5716bd.itemId);
      if (_0x4a3ece && _0x4a3ece <= Date.now()) {
        _0x158dcb.push({
          t: _0x3e6a9a,
          r: _0x5716bd,
          vence: _0x4a3ece
        });
      }
    }));
    return _0x158dcb;
  }
  function __ropaHoja(_0x2cc4bf, _0x59b1e3) {
    const _0xc0d671 = document.createElement("div");
    _0xc0d671.style.cssText = "font-family:Arial,Helvetica,sans-serif; color:#000; font-size:12pt; line-height:1.4;";
    const _0x5ad41a = (_0x33e4b9, _0x280fe4, _0x4585ee) => {
      const _0x387940 = document.createElement(_0x33e4b9);
      _0x387940.textContent = _0x280fe4;
      _0x387940.style.cssText = _0x4585ee || "";
      return _0x387940;
    };
    _0xc0d671.appendChild(_0x5ad41a("h1", "Entrega de ropa de trabajo", "font-size:18pt; margin:0 0 6mm;"));
    _0xc0d671.appendChild(_0x5ad41a("p", "Trabajador: " + _0x2cc4bf.nombre, "margin:0 0 1mm;"));
    _0xc0d671.appendChild(_0x5ad41a("p", "Fecha de entrega: " + __ropaFecha(_0x59b1e3.ts), "margin:0 0 6mm;"));
    const _0x1feb09 = document.createElement("table");
    _0x1feb09.style.cssText = "width:100%; border-collapse:collapse;";
    const _0x272033 = (_0x27d0e9, _0x213917) => {
      const _0x4a700d = document.createElement("tr");
      _0x27d0e9.forEach((_0x216a55, _0x34a84c) => {
        const _0x1a0463 = _0x5ad41a(_0x213917 ? "th" : "td", _0x216a55, "border:1px solid #000; padding:2mm 3mm; text-align:" + (_0x34a84c === 2 ? "right" : "left") + ";");
        _0x4a700d.appendChild(_0x1a0463);
      });
      return _0x4a700d;
    };
    _0x1feb09.appendChild(_0x272033(["Código", "Prenda", "Cantidad"], true));
    _0x59b1e3.lineas.forEach(_0x4a7820 => _0x1feb09.appendChild(_0x272033([_0x4a7820.code, _0x4a7820.desc || "", String(_0x4a7820.qty)])));
    _0xc0d671.appendChild(_0x1feb09);
    _0xc0d671.appendChild(_0x5ad41a("p", "El trabajador declara haber recibido las prendas indicadas.", "margin:8mm 0 20mm;"));
    const _0x311aef = document.createElement("div");
    _0x311aef.style.cssText = "display:flex; gap:20mm;";
    ["Firma del trabajador", "Entregado por"].forEach(_0x387a28 => {
      const _0x3820f7 = document.createElement("div");
      _0x3820f7.style.cssText = "flex:1; border-top:1px solid #000; padding-top:2mm; font-size:10pt;";
      _0x3820f7.textContent = _0x387a28;
      _0x311aef.appendChild(_0x3820f7);
    });
    _0xc0d671.appendChild(_0x311aef);
    return _0xc0d671;
  }
  const __TEXTO_CODIGO = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9][A-Za-z0-9._\/-]*$/;
  const __TEXTO_CANT = /^(?:[xX×])?(\d{1,4})$/;
  const __TEXTO_MEDIDA = /^(?:mm|cm|m|mt|mts|metro|metros|kg|g|gr|w|kw|v|a|amp|ah|l|lt|litro|litros|bar|pulgada|pulgadas)\b/i;
  function __textoCodigos() {
    return new Set((estado.catalog || []).map(_0x3d80ca => String(_0x3d80ca.code || "").toLowerCase()));
  }
  function __textoRepartir(_0x58e2a0, _0x25f7c4) {
    const _0xd084bc = _0x58e2a0.split(/\s+/);
    if (_0xd084bc.length < 2) {
      return [_0x58e2a0];
    }
    const _0x3d4bd5 = [];
    let _0x5183d7 = 0;
    for (const _0x3481b4 of _0xd084bc) {
      const _0x5e2d2f = __TEXTO_CANT.exec(_0x3481b4);
      if (_0x5e2d2f && !_0x25f7c4.has(_0x3481b4.toLowerCase())) {
        const _0x3368aa = _0x3d4bd5[_0x3d4bd5.length - 1];
        if (_0x3368aa && !_0x3368aa.q) {
          _0x3368aa.q = parseInt(_0x5e2d2f[1], 10);
        } else {
          _0x5183d7 = parseInt(_0x5e2d2f[1], 10);
        }
      } else if (_0x25f7c4.has(_0x3481b4.toLowerCase()) || __TEXTO_CODIGO.test(_0x3481b4)) {
        _0x3d4bd5.push({
          t: _0x3481b4,
          q: _0x5183d7
        });
        _0x5183d7 = 0;
      } else {
        return [_0x58e2a0];
      }
    }
    if (_0x3d4bd5.length < 2) {
      return [_0x58e2a0];
    }
    return _0x3d4bd5.map(_0x2eb54d => _0x2eb54d.q > 1 ? _0x2eb54d.t + " x" + _0x2eb54d.q : _0x2eb54d.t);
  }
  function __textoSegmentos(_0x572687) {
    const _0x501af6 = __textoCodigos();
    const _0x484516 = String(_0x572687 || "").split(/\r?\n|;|(?<!\d),|,(?!\d)/).map(_0x2116ad => _0x2116ad.replace(/^\s*[-•*·]+\s*/, "").trim());
    const _0x8eb4c2 = [];
    let _0x29a288 = "";
    _0x484516.forEach(_0x47614e => {
      if (/^\d{1,4}$/.test(_0x47614e) && !_0x501af6.has(_0x47614e)) {
        if (_0x8eb4c2.length) {
          _0x8eb4c2[_0x8eb4c2.length - 1] += " x" + _0x47614e;
        } else {
          _0x29a288 = _0x47614e + " x ";
        }
        return;
      }
      if (_0x47614e) {
        _0x8eb4c2.push(_0x29a288 + _0x47614e);
      }
      _0x29a288 = "";
    });
    const _0x4b9d2c = [];
    _0x8eb4c2.filter(_0x551450 => _0x551450.length > 1).forEach(_0x17c1f0 => __textoRepartir(_0x17c1f0, _0x501af6).forEach(_0x11a269 => _0x4b9d2c.push(_0x11a269)));
    return _0x4b9d2c.slice(0, 60);
  }
  function __textoCantidad(_0x4a7494) {
    const _0x2d09aa = __textoCodigos();
    const _0x1353d7 = _0x3c82d0 => Math.min(9999, Math.max(1, _0x3c82d0));
    let _0x240822 = /^(\d{1,4})\s*[xX×]\s*(?!\d)(\S.*)$/.exec(_0x4a7494) || /^(\d{1,4})\s*(?:uds?\.?|unidades?|u\.?|pzs?\.?|piezas?)\s+(\S.*)$/i.exec(_0x4a7494);
    if (_0x240822) {
      return {
        texto: _0x240822[2].trim(),
        qty: _0x1353d7(parseInt(_0x240822[1], 10))
      };
    }
    _0x240822 = /^(\d{1,4})\s+(\S.*)$/.exec(_0x4a7494);
    if (_0x240822 && !_0x2d09aa.has(_0x240822[1]) && /[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(_0x240822[2]) && !__TEXTO_MEDIDA.test(_0x240822[2])) {
      return {
        texto: _0x240822[2].trim(),
        qty: _0x1353d7(parseInt(_0x240822[1], 10))
      };
    }
    _0x240822 = /^(.*?\S)\s+(?:[xX×]\s*)?(\d{1,4})(?:\s*(?:uds?\.?|unidades?|u\.?|pzs?\.?|piezas?))?$/i.exec(_0x4a7494);
    if (_0x240822 && (/[A-Za-zÁÉÍÓÚÑáéíóúñ]/.test(_0x240822[1]) || _0x2d09aa.has(_0x240822[1].toLowerCase())) && !_0x2d09aa.has(_0x240822[2]) && !_0x2d09aa.has(_0x4a7494.toLowerCase())) {
      return {
        texto: _0x240822[1].trim(),
        qty: _0x1353d7(parseInt(_0x240822[2], 10))
      };
    }
    return {
      texto: _0x4a7494,
      qty: 1
    };
  }
  function __textoComplejo(_0x353ef1) {
    const _0x565aae = __clasifNormalizar(_0x353ef1).split(" ");
    const _0x4af095 = /\s(?:y|e|más|además|también|tambien)\s|\s\+\s/i.test(_0x353ef1);
    const _0x1feeff = _0x565aae.length >= 4 && _0x565aae.filter(_0x7b45ef => _0x7b45ef === _0x565aae[0]).length >= 2;
    return _0x4af095 && _0x353ef1.length > 12 || _0x1feeff;
  }
  async function __textoDividir(_0x47365e) {
    const _0x4cd92a = _0x47365e.filter(__textoComplejo);
    const _0x7002b = _0x4cd92a.length ? await __textoIA(_0x4cd92a) : "";
    const _0x4543fe = __clasifStore().ia.txt;
    const _0x533771 = [];
    _0x47365e.forEach(_0xd41188 => {
      const _0x6e3875 = __textoComplejo(_0xd41188) ? _0x4543fe[__clasifNormalizar(_0xd41188).slice(0, 200)] : null;
      const _0xb8baa3 = _0x6e3875 && _0x6e3875.r.length > 1 ? _0x6e3875.r.map(_0x19a5ba => String(Array.isArray(_0x19a5ba) ? _0x19a5ba[0] : _0x19a5ba)) : [_0xd41188];
      _0xb8baa3.forEach(_0x28788c => {
        const _0x4dda91 = __textoCantidad(_0x28788c);
        _0x533771.push({
          desc: _0x4dda91.texto,
          qty: _0x4dda91.qty,
          ia: _0xb8baa3.length > 1
        });
      });
    });
    return {
      lineas: _0x533771,
      aviso: _0x7002b
    };
  }
  async function __textoInterpretar() {
    const _0x2d0ae8 = (estado.catalog || []).map(_0x545581 => ({
      c: _0x545581,
      f: __clasifFichas(_0x545581.desc || "")
    }));
    const _0x5f1136 = await __textoDividir(__textoSegmentos(__textoEstado.texto));
    __textoEstado.aviso = _0x5f1136.aviso;
    __textoEstado.lineas = _0x5f1136.lineas.map(_0x22fba3 => {
      const _0x14f3aa = __textoRef(_0x22fba3.desc, _0x2d0ae8);
      return {
        desc: _0x22fba3.desc,
        qty: _0x22fba3.qty,
        ia: _0x22fba3.ia,
        ref: _0x14f3aa ? _0x14f3aa.id : "",
        marcada: true
      };
    });
    render();
  }
  function __textoAplicar(_0x36d90b) {
    const _0x559b08 = _0x36d90b.datos;
    const _0x541b90 = (__textoEstado.lineas || []).filter(_0x330065 => _0x330065.marcada);
    if (!_0x541b90.length) {
      return;
    }
    if (!_0x559b08.pendiente.requesterName) {
      _0x559b08.pendiente.requesterName = __textoEstado.quien.trim();
    }
    _0x541b90.forEach(_0x166189 => {
      const _0x44d8de = _0x166189.ref ? (estado.catalog || []).find(_0x29108c => _0x29108c.id === _0x166189.ref) : null;
      const _0x53f510 = _0x44d8de && _0x559b08.pendiente.items.find(_0x54d80f => _0x54d80f.itemId === _0x44d8de.id);
      const _0x1c790a = _0x166189.qty || 1;
      if (_0x53f510) {
        _0x53f510.qty += _0x1c790a;
      } else {
        _0x559b08.pendiente.items.push(_0x44d8de ? {
          id: nuevoId(),
          itemId: _0x44d8de.id,
          code: _0x44d8de.code,
          desc: _0x44d8de.desc,
          referencia: _0x44d8de.referencia || "",
          qty: _0x1c790a,
          pedido: 0,
          reserva: 0
        } : {
          id: nuevoId(),
          itemId: null,
          code: "",
          desc: "",
          referencia: "",
          textoLibre: _0x166189.desc,
          qty: _0x1c790a,
          pedido: 0,
          reserva: 0,
          destino: ""
        });
      }
    });
    anadirMensajeChat(_0x559b08.chat, "Lista de texto: " + _0x541b90.length + " línea" + (_0x541b90.length === 1 ? "" : "s") + " añadida" + (_0x541b90.length === 1 ? "" : "s") + " a la solicitud.");
    guardarGrupo(_0x36d90b.modo, _0x36d90b.nombre);
    __textoEstado.texto = "";
    __textoEstado.lineas = null;
    __textoEstado.aviso = "";
    render();
    __autoEnvioProgramar();
  }
  const __CLASIF_APRENDE_MIN = 3;
  const __CLASIF_APRENDE_PROP = 0.75;
  const __CLASIF_AUTO_MIN = 5;
  const __CLASIF_ORIGEN = {
    referencia: "Esta referencia se decidió así varias veces.",
    palabras: "Las palabras del texto se decidieron así varias veces.",
    lista: "Figura en la lista de pequeño material."
  };
  function __clasifAutoActivo() {
    return __clasifStore().autoAprende !== false;
  }
  const __CLASIF_EXT = [["proveedor", "Proveedor"], ["cliente", "Cliente"]];
  let __clasifSinPrevio = 0;
  const __CLASIF_VISTAS = [["sin", "Sin clasificar"], ["interno", "Interno"], ["externo", "Externo"]];
  const __PEDIDO_FORMATO = new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  let __hojaFiltro = "";
  function __hojaListas() {
    try {
      const _0x60ea67 = document.getElementById("hojaListas");
      if (_0x60ea67) {
        _0x60ea67.remove();
      }
      const _0x3dda05 = document.querySelector(".hoja-pedido-table");
      const _0x1dd96c = _0x1ea037();
      if (!_0x3dda05 || _0x2df77d() !== "almacen" || !_0x1dd96c || !_0x1dd96c.pendiente) {
        return;
      }
      const _0x2a0e6a = new Map((_0x1dd96c.pendiente.items || []).map(_0x5669d9 => [_0x5669d9.id, _0x5669d9]));
      const _0x4c11c9 = new Map((_0x1dd96c.pendiente.items || []).map(_0x10dca7 => [_0x10dca7.id, __clasifEstado(__clasifLinea(_0x10dca7))]));
      const _0x51ffad = {
        interno: 0,
        externo: 0,
        sin: 0
      };
      _0x4c11c9.forEach(_0xbdee65 => {
        _0x51ffad[_0xbdee65]++;
      });
      if (!_0x4c11c9.size) {
        return;
      }
      const _0x4cbff0 = [["interno", "Interno"], ["externo", "Externo"], ["sin", "Sin clasificar"]].filter(_0x3c838b => _0x3c838b[0] !== "sin" || _0x51ffad.sin);
      if (!_0x4cbff0.some(_0x3566f7 => _0x3566f7[0] === __hojaFiltro)) {
        __hojaFiltro = (_0x4cbff0.find(_0x21066e => _0x51ffad[_0x21066e[0]]) || _0x4cbff0[0])[0];
      }
      const _0x3903b0 = [..._0x3dda05.querySelectorAll("th")];
      const _0x193792 = _0x5a9002 => _0x3903b0.findIndex(_0x29c9da => (_0x29c9da.dataset.orig || _0x29c9da.textContent).trim().toLowerCase().startsWith(_0x5a9002));
      const _0x59a260 = _0x193792("escandallo");
      const _0x3c049b = _0x193792("recibido");
      _0x3903b0.forEach(_0x23d053 => {
        if (!_0x23d053.dataset.orig) {
          _0x23d053.dataset.orig = _0x23d053.textContent;
        }
      });
      if (_0x3c049b >= 0) {
        _0x3903b0[_0x3c049b].textContent = "Entregado";
      }
      if (_0x59a260 >= 0) {
        _0x3903b0[_0x59a260].textContent = __hojaFiltro === "interno" ? "Escandallo" : __hojaFiltro === "externo" ? "Pedido" : _0x3903b0[_0x59a260].dataset.orig;
      }
      _0x3dda05.querySelectorAll("tr").forEach(_0x686bfb => {
        const _0x4c41a3 = _0x686bfb.querySelector("[data-hoja-id]");
        if (_0x4c41a3) {
          _0x686bfb.style.display = _0x4c11c9.get(_0x4c41a3.getAttribute("data-hoja-id")) === __hojaFiltro ? "" : "none";
        }
        const _0x217379 = _0x59a260 >= 0 ? _0x686bfb.children[_0x59a260] : null;
        if (_0x217379 && _0x4c41a3) {
          const _0x1cca22 = _0x217379.querySelector(".hoja-estado");
          if (_0x1cca22) {
            _0x1cca22.remove();
          }
          if (__hojaFiltro === "externo" && _0x4c11c9.get(_0x4c41a3.getAttribute("data-hoja-id")) === "externo") {
            const _0x5a58c9 = (_0x2a0e6a.get(_0x4c41a3.getAttribute("data-hoja-id")) || {}).escandalloPedido === "Pedido";
            const _0x4bc666 = document.createElement("div");
            _0x4bc666.className = "hoja-estado clasif-tag";
            _0x4bc666.textContent = _0x5a58c9 ? "Pedido" : "Sin pedir";
            _0x217379.insertBefore(_0x4bc666, _0x217379.firstChild);
          }
        }
        if (_0x217379) {
          _0x217379.querySelectorAll("option").forEach(_0x527351 => {
            _0x527351.hidden = _0x527351.value === "Escandallo" && __hojaFiltro === "externo" || _0x527351.value === "Pedido" && __hojaFiltro === "interno";
          });
        }
      });
      const _0x124a02 = document.getElementById("marcarEscandalloBtn");
      const _0x2d2974 = document.getElementById("marcarPedidoBtn");
      if (_0x124a02) {
        _0x124a02.style.display = __hojaFiltro === "externo" ? "none" : "";
      }
      if (_0x2d2974) {
        _0x2d2974.style.display = __hojaFiltro === "interno" ? "none" : "";
      }
      const _0x37768c = document.getElementById("hojaListaVacia");
      if (_0x37768c) {
        _0x37768c.remove();
      }
      const _0x18049b = document.createElement("div");
      _0x18049b.id = "hojaListas";
      _0x18049b.className = "clasif-seg";
      _0x18049b.style.margin = "8px 0";
      _0x18049b.innerHTML = _0x4cbff0.map(_0x5264a9 => "<button type=\"button\" class=\"" + (__hojaFiltro === _0x5264a9[0] ? "on" : "") + "\" data-lista=\"" + _0x5264a9[0] + "\">" + _0x5264a9[1] + " (" + _0x51ffad[_0x5264a9[0]] + ")</button>").join("");
      _0x18049b.querySelectorAll("button").forEach(_0x39c6b6 => _0x39c6b6.addEventListener("click", () => {
        __hojaFiltro = _0x39c6b6.getAttribute("data-lista");
        __hojaListas();
      }));
      _0x3dda05.insertAdjacentElement("beforebegin", _0x18049b);
      _0x3dda05.style.display = _0x51ffad[__hojaFiltro] ? "" : "none";
      if (!_0x51ffad[__hojaFiltro]) {
        const _0x2d177b = document.createElement("p");
        _0x2d177b.id = "hojaListaVacia";
        _0x2d177b.className = "eyebrow";
        _0x2d177b.textContent = "No hay líneas en esta lista.";
        _0x18049b.insertAdjacentElement("afterend", _0x2d177b);
      }
    } catch (_0x5d2c17) {}
  }
  function __hojaLineasLista(_0x29b7bd) {
    const _0x1243aa = _0x29b7bd.pendiente.items;
    if (_0x2df77d() !== "almacen" || !document.getElementById("hojaListas")) {
      return _0x1243aa;
    }
    return _0x1243aa.filter(_0x23010e => __clasifEstado(__clasifLinea(_0x23010e)) === __hojaFiltro);
  }
  function __servirExterno(_0x39638a, _0x14e115) {
    const _0x1ef606 = fechaHoraTexto();
    const _0x25d44d = String(_0x14e115.code || "");
    const _0x13d878 = _0x14e115.desc || _0x14e115.texto || "";
    const _0x2f7bd0 = _0x39638a.servido.find(_0x6e0052 => _0x6e0052.externo && String(_0x6e0052.code || "").toLowerCase() === _0x25d44d.toLowerCase() && (_0x6e0052.desc || "") === _0x13d878);
    if (_0x2f7bd0) {
      _0x2f7bd0.qty += _0x14e115.qty;
      _0x2f7bd0.ts = _0x1ef606;
      return;
    }
    _0x39638a.servido.push({
      id: nuevoId(),
      itemId: _0x14e115.itemId || null,
      code: _0x25d44d,
      desc: _0x13d878,
      qty: _0x14e115.qty,
      firstTs: _0x1ef606,
      ts: _0x1ef606,
      escandalloPedido: "",
      escandalloPedidoNumero: "",
      externo: true
    });
  }
  let __servidoFiltro = "interno";
  function __servidoListas() {
    try {
      const _0x576af0 = document.getElementById("servidoListas");
      if (_0x576af0) {
        _0x576af0.remove();
      }
      const _0x3dc6f3 = document.querySelector(".ticket-body");
      const _0x487d5d = _0x1ea037();
      if (_0x5592da !== "servido" || !_0x3dc6f3 || !_0x487d5d) {
        return;
      }
      const _0x58630c = document.getElementById("servidoVacio");
      if (_0x58630c) {
        _0x58630c.remove();
      }
      const _0x1b9b92 = new Set((_0x487d5d.servido || []).filter(_0x401da8 => _0x401da8.externo).map(_0x27e815 => _0x27e815.id));
      const _0xb3425b = [..._0x3dc6f3.querySelectorAll(".ticket-row[data-id]")];
      const _0x4a6f2e = {
        interno: _0xb3425b.filter(_0x43542a => !_0x1b9b92.has(_0x43542a.dataset.id)).length,
        externo: _0xb3425b.filter(_0x2193bf => _0x1b9b92.has(_0x2193bf.dataset.id)).length
      };
      const _0x414853 = [["interno", "Interno"], ["externo", "Externo"]];
      _0xb3425b.forEach(_0x23413a => {
        const _0x199509 = _0x1b9b92.has(_0x23413a.dataset.id);
        _0x23413a.style.display = (_0x199509 ? "externo" : "interno") === __servidoFiltro ? "" : "none";
        if (_0x199509) {
          _0x23413a.querySelectorAll(".return-qty,.btn-return").forEach(_0x23aa26 => {
            _0x23aa26.style.display = "none";
          });
        }
      });
      const _0x42dfc8 = document.createElement("div");
      _0x42dfc8.id = "servidoListas";
      _0x42dfc8.className = "clasif-seg";
      _0x42dfc8.style.margin = "8px 0";
      _0x42dfc8.innerHTML = _0x414853.map(_0xc2ee5b => "<button type=\"button\" class=\"" + (__servidoFiltro === _0xc2ee5b[0] ? "on" : "") + "\" data-lista=\"" + _0xc2ee5b[0] + "\">" + _0xc2ee5b[1] + " (" + _0x4a6f2e[_0xc2ee5b[0]] + ")</button>").join("");
      _0x42dfc8.querySelectorAll("button").forEach(_0x430f3d => _0x430f3d.addEventListener("click", () => {
        __servidoFiltro = _0x430f3d.getAttribute("data-lista");
        __servidoListas();
      }));
      _0x3dc6f3.parentElement.insertAdjacentElement("beforebegin", _0x42dfc8);
      if (!_0x4a6f2e[__servidoFiltro]) {
        const _0x22556e = document.createElement("p");
        _0x22556e.id = "servidoVacio";
        _0x22556e.className = "eyebrow";
        _0x22556e.textContent = "No hay entregas en esta lista.";
        _0x3dc6f3.insertAdjacentElement("afterbegin", _0x22556e);
      }
    } catch (_0x5348b5) {}
  }
  async function __ofrecerExterno(_0x97d9bd) {
    const _0x4ecb78 = __hojaLineasLista(_0x97d9bd).map(_0x1f38c8 => {
      const _0x52047d = _0x1f38c8.itemId ? estado.catalog.find(_0x404b7a => _0x404b7a.id === _0x1f38c8.itemId) : _0x1f38c8.code ? buscarPorCodigo(_0x1f38c8.code) : null;
      return {
        it: _0x1f38c8,
        hay: _0x52047d ? _0x52047d.qty : 0
      };
    }).filter(_0x550433 => _0x550433.hay < _0x550433.it.qty);
    if (!_0x4ecb78.length) {
      return;
    }
    const _0x255e9d = _0x4ecb78.map(_0x4991f8 => __clasifNombreLinea(_0x4991f8.it) + " (pedidas " + _0x4991f8.it.qty + ", en stock " + _0x4991f8.hay + ")").join(", ");
    if (!(await _0x2cc777("Falta stock de: " + _0x255e9d + ". Si es material que llega de fuera, pasa a la lista Externo y se entrega sin comprobar ni mover el stock. ¿Pasar a Externo?"))) {
      return;
    }
    _0x4ecb78.forEach(_0x49c025 => __clasifFijar(_0x49c025.it, "externo"));
    __hojaFiltro = "externo";
    _0x308988();
  }
  const __DIA_MS = 86400000;
  function __consumo30(_0x3ed777) {
    const _0x572b83 = Date.now() - __DIA_MS * 30;
    return (estado.movements || []).reduce((_0x48e915, _0x5d13d6) => _0x5d13d6.type === "salida" && _0x5d13d6.code === _0x3ed777 && _0x5d13d6.tsMs >= _0x572b83 ? _0x48e915 + _0x5d13d6.qty : _0x48e915, 0);
  }
  function __cantidadReposicion(_0x58c544, _0x3b0198) {
    return Math.max(1, _0x3b0198 * 2 - _0x58c544.qty, Math.ceil(__consumo30(_0x58c544.code)) - _0x58c544.qty);
  }
  function __reposicionLista() {
    const _0x47a8c6 = _0x41ba69();
    const _0x12fdfd = new Set(_0x47a8c6.map(_0x5c9fdf => _0x5c9fdf.id));
    const _0x3a9829 = (estado.catalog || []).filter(_0x4afadb => {
      const _0x412619 = __consumo30(_0x4afadb.code);
      return !_0x12fdfd.has(_0x4afadb.id) && _0x4afadb.qty > 0 && _0x412619 > 0 && _0x4afadb.qty / (_0x412619 / 30) <= 7;
    });
    return _0x47a8c6.concat(_0x3a9829);
  }
  function __reposicionAjustar() {
    const _0x1aa2d5 = document.getElementById("reposicionPanel");
    if (!_0x1aa2d5) {
      return;
    }
    const _0x38de68 = _0x1aa2d5.querySelectorAll("p")[1];
    if (_0x38de68) {
      _0x38de68.textContent = "Materiales por debajo de su mínimo o que se agotan en una semana. La cantidad propuesta cubre el consumo de 30 días o el doble del mínimo, el valor que sea mayor; se puede cambiar antes de copiar o enviar.";
    }
    _0x1aa2d5.querySelectorAll("[data-repo-sel]").forEach(_0x2f7a16 => {
      const _0x4cd20a = (estado.catalog || []).find(_0x89e0bc => _0x89e0bc.id === _0x2f7a16.getAttribute("data-repo-sel"));
      if (!_0x4cd20a) {
        return;
      }
      const _0x9b9019 = _0x2f7a16.closest("label");
      const _0x415649 = __consumo30(_0x4cd20a.code);
      const _0x3683c4 = _0x9b9019.querySelector("small");
      _0x9b9019.querySelector("[data-repo-cant]").value = __cantidadReposicion(_0x4cd20a, __clasifMinimo(_0x4cd20a));
      if (_0x3683c4 && _0x415649) {
        _0x3683c4.textContent += " · consumo 30 días: " + _0x415649;
      }
    });
  }
  function __sugerencias() {
    const _0xb00145 = Date.now();
    const _0x175df4 = [];
    const _0x3286db = new Map();
    let _0x520269 = 0;
    let _0x332078 = 0;
    Object.keys(estado.groupData || {}).forEach(_0x4c2789 => {
      const _0x3dabd0 = estado.groupData[_0x4c2789] || {};
      const _0x10b46a = _0x3dabd0.pendiente ? _0x3dabd0.pendiente.items || [] : [];
      const _0x202091 = _0x10b46a.concat(_0x3dabd0.servido || []).filter(_0x462e6e => !_0x462e6e.itemId && !_0x462e6e.code);
      _0x202091.forEach(_0x15571b => {
        const _0x1939b7 = String(_0x15571b.textoLibre || _0x15571b.desc || "").trim().toLowerCase();
        if (_0x1939b7) {
          _0x3286db.set(_0x1939b7, (_0x3286db.get(_0x1939b7) || 0) + 1);
        }
      });
      _0x10b46a.forEach(_0x30b55c => {
        if (_0x30b55c.fecha && _0xb00145 - _0x30b55c.fecha > __DIA_MS * 3) {
          _0x332078++;
        }
        if (_0x30b55c.fecha && _0xb00145 - _0x30b55c.fecha > __DIA_MS * 2 && __clasifEstado(__clasifLinea(_0x30b55c)) === "externo" && _0x30b55c.escandalloPedido !== "Pedido") {
          _0x520269++;
        }
      });
    });
    [..._0x3286db].filter(_0x412389 => _0x412389[1] >= 3).sort((_0x4e7c4c, _0x5eb378) => _0x5eb378[1] - _0x4e7c4c[1]).slice(0, 2).forEach(_0x52c925 => _0x175df4.push("«" + _0x52c925[0] + "» se ha pedido " + _0x52c925[1] + " veces sin referencia: conviene darla de alta en Almacén."));
    if (_0x520269) {
      _0x175df4.push(_0x520269 + " línea" + (_0x520269 === 1 ? "" : "s") + " externa" + (_0x520269 === 1 ? "" : "s") + " con más de 2 días sin marcar como pedida.");
    }
    if (_0x332078) {
      _0x175df4.push(_0x332078 + " línea" + (_0x332078 === 1 ? "" : "s") + " pendiente" + (_0x332078 === 1 ? "" : "s") + " de entregar desde hace más de 3 días.");
    }
    return _0x175df4;
  }
  function __analisisTexto(_0x53664c) {
    const _0x5d91f6 = __sugerencias();
    return "Consumo 30 días (uds): " + (_0x53664c.top.join("; ") || "sin datos") + "\nSe agotan en ≤10 días: " + (_0x53664c.agotan.join("; ") || "ninguno") + "\nStock bajo (" + _0x53664c.nBajo + "): " + (_0x53664c.bajo.join("; ") || "ninguno") + "\nSalidas anómalas: " + (_0x53664c.anomalias.join("; ") || "ninguna") + "\nReferencias con stock sin movimiento en 90 días: " + _0x53664c.latentes + (_0x5d91f6.length ? "\nPedidos: " + _0x5d91f6.join(" ") : "");
  }
  function __fusionarAvisos() {
    const _0x2a7b1e = estado.notifications || [];
    const _0x1d29b8 = new Map();
    _0x2a7b1e.forEach(_0x2c70f0 => {
      if (_0x2c70f0.leida) {
        return;
      }
      const _0x58253b = (_0x2c70f0.para || "almacen") + "::" + _0x2c70f0.groupKind + "::" + _0x2c70f0.groupName;
      if (!_0x1d29b8.has(_0x58253b) || (_0x2c70f0.tsMs || 0) >= (_0x1d29b8.get(_0x58253b).tsMs || 0)) {
        _0x1d29b8.set(_0x58253b, _0x2c70f0);
      }
    });
    const _0x27d284 = _0x2a7b1e.filter(_0x3f0e12 => !_0x3f0e12.leida && _0x1d29b8.get((_0x3f0e12.para || "almacen") + "::" + _0x3f0e12.groupKind + "::" + _0x3f0e12.groupName) !== _0x3f0e12);
    if (!_0x27d284.length) {
      return;
    }
    _0x27d284.forEach(_0x4d9df3 => _0x2a7b1e.splice(_0x2a7b1e.indexOf(_0x4d9df3), 1));
    guardarAvisos();
    setTimeout(render, 0);
  }
  function __resumenPorRevisar() {
    try {
      const _0x53b166 = document.getElementById("resumenPorRevisar");
      if (_0x53b166) {
        _0x53b166.remove();
      }
      const _0x3564e4 = document.getElementById("alertBanner");
      if (_0x3564e4 && estado.mode === "resumen") {
        _0x3564e4.style.display = "none";
      }
      const _0x390bce = [...document.querySelectorAll("p")].find(_0x24a205 => _0x24a205.textContent.startsWith("Lo más urgente"));
      if (estado.mode !== "resumen" || _0x2df77d() !== "almacen" || !_0x390bce) {
        return;
      }
      const _0x277079 = [];
      Object.keys(estado.groupData || {}).forEach(_0x4093ea => {
        const _0x1ea925 = _0x4093ea.split("::");
        const _0x129c4b = estado.groupData[_0x4093ea];
        const _0x39c591 = _0x129c4b && _0x129c4b.pendiente ? _0x129c4b.pendiente.items || [] : [];
        if (_0x1ea925[0] !== "montaje" && _0x1ea925[0] !== "proyecto" || !_0x39c591.length) {
          return;
        }
        const _0x1bd3a7 = _0x39c591.map(_0x3f09eb => __clasifEstado(__clasifLinea(_0x3f09eb)));
        const _0x13a3cc = _0x1bd3a7.filter(_0x22e181 => _0x22e181 === "sin").length;
        const _0x3ec05a = _0x39c591.filter((_0xf2917f, _0x1e3229) => _0x1bd3a7[_0x1e3229] === "externo" && _0xf2917f.escandalloPedido !== "Pedido").length;
        const _0x23b1bf = [_0x39c591.length + " por entregar"];
        if (_0x13a3cc) {
          _0x23b1bf.push(_0x13a3cc + " sin clasificar");
        }
        if (_0x3ec05a) {
          _0x23b1bf.push(_0x3ec05a + " externa" + (_0x3ec05a === 1 ? "" : "s") + " sin pedir");
        }
        _0x277079.push({
          modo: _0x1ea925[0],
          nombre: _0x1ea925.slice(1).join("::"),
          texto: _0x23b1bf.join(" · ")
        });
      });
      const _0x470f85 = __sugerencias();
      if (!_0x277079.length && !_0x470f85.length) {
        return;
      }
      const _0x4e6684 = _0x1d1ab0;
      const _0x242cdb = document.createElement("div");
      _0x242cdb.id = "resumenPorRevisar";
      _0x242cdb.className = "panel";
      _0x242cdb.innerHTML = "<p class=\"panel-title\">Por revisar</p>" + _0x277079.map((_0x4dba9f, _0x281085) => "<button type=\"button\" class=\"cam-btn\" data-fila=\"" + _0x281085 + "\" style=\"width:100%; text-align:left; margin-top:6px;\"><strong>" + _0x4e6684(_0x4dba9f.nombre) + "</strong> <small>" + _0x4e6684(_0x4dba9f.texto) + "</small></button>").join("") + (_0x470f85.length ? "<p class=\"eyebrow\" style=\"margin:12px 0 4px;\">Sugerencias</p>" + _0x470f85.map(_0x5bde9f => "<p style=\"margin:0 0 4px; font-size:12.5px;\">" + _0x4e6684(_0x5bde9f) + "</p>").join("") : "");
      _0x242cdb.querySelectorAll("button").forEach(_0xa513d3 => _0xa513d3.addEventListener("click", () => {
        const _0x5399ef = _0x277079[+_0xa513d3.getAttribute("data-fila")];
        estado.mode = _0x5399ef.modo;
        estado.current[_0x5399ef.modo] = _0x5399ef.nombre;
        _0x5592da = "hoja";
        render();
      }));
      _0x390bce.insertAdjacentElement("afterend", _0x242cdb);
    } catch (_0x1802f8) {}
  }
  function __actualizacionSegura() {
    __clasifVaciar();
    const _0x499ad1 = [...document.querySelectorAll("textarea:not([readonly])")].some(_0x134bc2 => _0x134bc2.value.trim());
    if (_0x499ad1) {
      _0x279f78("Hay texto sin enviar. Enviarlo o borrarlo y volver a pulsar «Actualizar ahora».");
    }
    return !_0x499ad1;
  }
  window.__actualizacionSegura = __actualizacionSegura;
  function __clasifConservarVista() {
    const _0x135f07 = document.getElementById("clasifRevision");
    const _0x5e0ccc = _0x135f07 ? _0x135f07.getBoundingClientRect().top : null;
    __clasifPostRender();
    const _0x830cb3 = document.getElementById("clasifRevision");
    if (_0x5e0ccc === null || !_0x830cb3) {
      return;
    }
    const _0x5a04b8 = _0x830cb3.getBoundingClientRect().top - _0x5e0ccc;
    if (Math.abs(_0x5a04b8) > 1) {
      window.scrollBy(0, _0x5a04b8);
    }
  }
  function __pedidoFechaTexto(_0x568c94) {
    if (_0x568c94) {
      return __PEDIDO_FORMATO.format(new Date(_0x568c94)).replace(",", "");
    } else {
      return "";
    }
  }
  function __pedidoFechas() {
    try {
      const _0x4f135b = _0x1ea037();
      if (!_0x4f135b || !_0x4f135b.pendiente) {
        return;
      }
      const _0x94f0c2 = _0x4f135b.pendiente.items || [];
      const _0x172510 = _0x94f0c2.filter(_0xd236d0 => !_0xd236d0.fecha);
      if (_0x172510.length) {
        const _0x30e139 = Date.now();
        _0x172510.forEach(_0x1da766 => {
          _0x1da766.fecha = _0x30e139;
        });
        guardarGrupo(estado.mode, estado.current[estado.mode]);
      }
      document.querySelectorAll(".hoja-pedido-table [data-select-hoja-id]").forEach(_0x1401a9 => {
        const _0x2a07b2 = _0x94f0c2.find(_0x84134 => _0x84134.id === _0x1401a9.getAttribute("data-select-hoja-id"));
        const _0x152a53 = _0x1401a9.closest("tr").children[2];
        if (_0x2a07b2 && _0x152a53) {
          _0x152a53.textContent = __pedidoFechaTexto(_0x2a07b2.fecha);
        }
      });
    } catch (_0x488527) {}
  }
  function __clasifPredecirAprendido(_0x32e65c, _0x4ef626) {
    const _0x5608a1 = __clasifStore();
    const _0x43823f = _0x396f26 => {
      if (!_0x396f26) {
        return null;
      }
      const _0x236502 = (_0x396f26.interno || 0) + (_0x396f26.externo || 0) + (_0x396f26.pequeno || 0);
      let _0x869473 = null;
      let _0x4e163f = 0;
      ["interno", "externo", "pequeno"].forEach(_0x135eb4 => {
        if ((_0x396f26[_0x135eb4] || 0) > _0x4e163f) {
          _0x4e163f = _0x396f26[_0x135eb4];
          _0x869473 = _0x135eb4;
        }
      });
      if (_0x869473 && _0x4e163f >= __CLASIF_APRENDE_MIN && _0x4e163f / _0x236502 >= __CLASIF_APRENDE_PROP) {
        return {
          t: _0x869473,
          fuerte: _0x4e163f >= __CLASIF_AUTO_MIN && _0x4e163f === _0x236502
        };
      } else {
        return null;
      }
    };
    if (_0x32e65c) {
      const _0x415920 = _0x43823f(_0x5608a1.ref[String(_0x32e65c).toLowerCase()]);
      if (_0x415920) {
        return {
          tipo: _0x415920.t,
          origen: "referencia",
          fuerte: _0x415920.fuerte
        };
      } else {
        return null;
      }
    }
    const _0x26a49a = [];
    __clasifPalabras(_0x4ef626).forEach(_0xda05d => {
      const _0x1b2835 = _0x43823f(_0x5608a1.pal[_0xda05d]);
      if (_0x1b2835) {
        _0x26a49a.push(_0x1b2835);
      }
    });
    if (_0x26a49a.length && _0x26a49a.every(_0x344658 => _0x344658.t === _0x26a49a[0].t)) {
      return {
        tipo: _0x26a49a[0].t,
        origen: "palabras",
        fuerte: _0x26a49a.every(_0x8726f1 => _0x8726f1.fuerte)
      };
    } else {
      return null;
    }
  }
  function __clasifPredecir(_0x143868, _0x58654a) {
    if (__clasifEnPQ(_0x143868, _0x58654a)) {
      return {
        tipo: "pequeno",
        origen: "lista"
      };
    }
    return __clasifPredecirAprendido(_0x143868, _0x58654a);
  }
  function __clasifLinea(_0x5217f2) {
    if (__TIPOS_MATERIAL.some(_0x454b1b => _0x454b1b[0] === _0x5217f2.tipo)) {
      return {
        tipo: _0x5217f2.tipo,
        ok: !!_0x5217f2.tipoOk
      };
    }
    const _0x4d4298 = __clasifPredecir(_0x5217f2.code, __clasifTextoLinea(_0x5217f2));
    if (_0x4d4298 && _0x4d4298.fuerte && __clasifAutoActivo()) {
      return {
        tipo: _0x4d4298.tipo,
        ok: true,
        origen: _0x4d4298.origen,
        auto: true
      };
    }
    if (_0x4d4298) {
      return {
        tipo: _0x4d4298.tipo,
        ok: false,
        origen: _0x4d4298.origen
      };
    }
    const _0xabedde = __iaEntrada(_0x5217f2);
    if (_0xabedde && _0xabedde.t) {
      return {
        tipo: _0xabedde.t,
        ok: false,
        ia: true
      };
    }
    return {
      tipo: null,
      ok: false
    };
  }
  function __clasifEstado(_0x23f450) {
    if (!_0x23f450.tipo || !_0x23f450.ok) {
      return "sin";
    }
    if (_0x23f450.tipo === "externo") {
      return "externo";
    } else {
      return "interno";
    }
  }
  function __clasifFijar(_0x13d35c, _0x5e61dc) {
    if (_0x13d35c.tipoAprendido && _0x13d35c.tipoAprendido !== _0x5e61dc) {
      __clasifAjustar(_0x13d35c.code, __clasifTextoLinea(_0x13d35c), _0x13d35c.tipoAprendido, -1);
    }
    if (_0x13d35c.tipoAprendido !== _0x5e61dc) {
      __clasifAjustar(_0x13d35c.code, __clasifTextoLinea(_0x13d35c), _0x5e61dc, 1);
    }
    const _0x4d0193 = __iaEntrada(_0x13d35c);
    if (_0x4d0193 && _0x4d0193.t) {
      _0x4d0193.t = _0x5e61dc;
    }
    if (_0x5e61dc === "pequeno") {
      __clasifRegistrarPQ(_0x13d35c);
    }
    _0x13d35c.tipo = _0x5e61dc;
    _0x13d35c.tipoOk = true;
    _0x13d35c.tipoAprendido = _0x5e61dc;
    if (_0x5e61dc !== "externo") {
      delete _0x13d35c.extDestino;
    }
    __clasifGuardarPronto();
    if (_0x5e61dc === "externo") {
      __autoEnvioProgramar();
    }
  }
  function __clasifAutoRefs(_0x198662) {
    let _0x622152 = 0;
    _0x198662.forEach(_0x562dc4 => {
      if (_0x562dc4.code || !_0x562dc4.textoLibre || __clasifEnPQ("", _0x562dc4.textoLibre)) {
        return;
      }
      let _0x234838 = __clasifRefDirecta(_0x562dc4.textoLibre, _0x562dc4.asocRechazada);
      if (!_0x234838) {
        const _0x4659cc = __clasifSugerirRef(_0x562dc4.textoLibre, _0x562dc4.asocRechazada);
        if (_0x4659cc && _0x4659cc.sim >= __REF_AUTO_SIM && _0x4659cc.votos >= __CLASIF_APRENDE_MIN) {
          _0x234838 = _0x4659cc.cat;
        }
      }
      if (!_0x234838) {
        return;
      }
      _0x562dc4.textoOrig = _0x562dc4.textoLibre;
      _0x562dc4.itemId = _0x234838.id;
      _0x562dc4.code = _0x234838.code;
      _0x562dc4.desc = _0x234838.desc;
      _0x562dc4.referencia = _0x234838.referencia || "";
      delete _0x562dc4.textoLibre;
      _0x562dc4.refAuto = "alg";
      _0x622152++;
    });
    return _0x622152;
  }
  function __clasifRefSugerida(_0x25f44b) {
    const _0x258665 = __clasifSugerirRef(_0x25f44b.textoLibre, _0x25f44b.asocRechazada);
    if (_0x258665) {
      return {
        cat: _0x258665.cat
      };
    }
    const _0x4de97f = __stockCoincidencia(_0x25f44b.textoLibre).unica;
    if (_0x4de97f && _0x4de97f.code !== _0x25f44b.asocRechazada) {
      return {
        cat: _0x4de97f
      };
    }
    const _0x15c7ff = __iaRef(_0x25f44b);
    if (_0x15c7ff && _0x15c7ff.cat.code !== _0x25f44b.asocRechazada) {
      return {
        cat: _0x15c7ff.cat,
        ia: true
      };
    } else {
      return null;
    }
  }
  function __clasifPlanoDe(_0x5659c7, _0x5e3e20) {
    const _0x35c92e = (estado.groupData || {})[_0x5659c7 + "::" + _0x5e3e20];
    return String(_0x35c92e && _0x35c92e.pendiente && _0x35c92e.pendiente.plano || "").trim();
  }
  function __clasifNuevaPeticion(_0x18779e, _0x4184ae, _0x39861e) {
    const _0x5c10d = _0x4184ae || estado.mode;
    const _0x19cb4a = _0x5c10d === "montaje" ? "montaje" : "proyecto";
    const _0x412b06 = _0x39861e || estado.current[_0x5c10d] || "";
    return {
      id: nuevoId(),
      ts: Date.now(),
      modo: _0x19cb4a,
      orden: _0x412b06,
      plano: __clasifPlanoDe(_0x19cb4a, _0x412b06),
      lineas: _0x18779e.map(_0x2ea79c => ({
        nombre: __clasifNombreLinea(_0x2ea79c),
        qty: parseInt(_0x2ea79c.qty, 10) || 1,
        destino: _0x2ea79c.extDestino || ""
      }))
    };
  }
  function __clasifTextoCorreo(_0x42ab34) {
    const _0x287f05 = Object.fromEntries(__CLASIF_EXT);
    const _0xbd7e6c = _0x42ab34.map(_0x3253fd => "Número de plano: " + (_0x3253fd.plano || "(sin indicar)") + "\n" + _0x3253fd.lineas.map(_0x20af81 => "- " + _0x20af81.nombre + " — " + _0x20af81.qty + (_0x20af81.qty === 1 ? " unidad" : " unidades") + (_0x20af81.destino ? " (" + _0x287f05[_0x20af81.destino] + ")" : "")).join("\n"));
    return "Buenas tardes,\n\nEste es el listado de material que me falta por suministrar.\n\n" + _0xbd7e6c.join("\n\n") + "\n\nUn saludo.";
  }
  function __clasifTextoPeticion(_0x3fd7f0) {
    return __clasifTextoCorreo([_0x3fd7f0]);
  }
  function __extAsunto(_0x10a3c7) {
    const _0x31237d = _0x10a3c7.map(_0x40efbf => _0x40efbf.plano).filter(Boolean);
    return "Material por suministrar" + (_0x31237d.length ? " — plano" + (_0x31237d.length === 1 ? " " : "s ") + _0x31237d.join(", ") : "");
  }
  const __extExcluidos = new Set();
  function __extGrupos() {
    const _0x40f2fb = [];
    Object.keys(estado.groupData || {}).forEach(_0x22f47e => {
      const _0x340eb8 = _0x22f47e.split("::");
      if (_0x340eb8[0] !== "montaje" && _0x340eb8[0] !== "proyecto") {
        return;
      }
      const _0x391e10 = estado.groupData[_0x22f47e];
      const _0x50c8f4 = (_0x391e10 && _0x391e10.pendiente && _0x391e10.pendiente.items || []).filter(_0x31e6b8 => !_0x31e6b8.extPeticion && __clasifEstado(__clasifLinea(_0x31e6b8)) === "externo");
      if (_0x50c8f4.length) {
        _0x40f2fb.push({
          clave: _0x22f47e,
          modo: _0x340eb8[0],
          nombre: _0x340eb8.slice(1).join("::"),
          grupo: _0x391e10,
          items: _0x50c8f4
        });
      }
    });
    return _0x40f2fb;
  }
  function __extMarcarPedido(_0x33c1f1) {
    _0x33c1f1.forEach(_0x211c75 => {
      if (!_0x211c75.escandalloPedido) {
        _0x211c75.escandalloPedido = "Pedido";
      }
    });
  }
  function __extRegistrar(_0x3e4ea3) {
    _0x3e4ea3.forEach(_0x5cfa5c => {
      __clasifRegistrarPeticion(_0x5cfa5c.pet, _0x5cfa5c.g.items);
      __extMarcarPedido(_0x5cfa5c.g.items);
      guardarGrupo(_0x5cfa5c.g.modo, _0x5cfa5c.g.nombre);
    });
    __guardarClasif();
  }
  function __autoEnvioLineas(_0x57fe1a, _0x1c809f) {
    const _0x3c83c3 = (estado.groupData || {})[_0x57fe1a + "::" + _0x1c809f];
    const _0xd23c16 = _0x3c83c3 && _0x3c83c3.pendiente ? _0x3c83c3.pendiente.items || [] : [];
    if (__clasifAutoRefs(_0xd23c16)) {
      __clasifGuardarPronto();
    }
    return _0xd23c16.filter(_0x27c244 => {
      if (_0x27c244.extPeticion) {
        return false;
      }
      const _0x37ec72 = __clasifLinea(_0x27c244);
      return _0x37ec72.tipo === "externo" && _0x37ec72.ok && !_0x37ec72.auto;
    });
  }
  async function __autoEnvioEjecutar() {
    const _0x1b9063 = __autoEnvio;
    if (!_0x1b9063) {
      return;
    }
    __autoEnvioCancelar();
    const _0x10ee88 = (__clasifStore().email || "").trim();
    const _0x4dd1d2 = __autoEnvioLineas(_0x1b9063.modo, _0x1b9063.nombre);
    if (!_0x4dd1d2.length || !_0x10ee88) {
      return;
    }
    const _0x32dfd5 = __clasifNuevaPeticion(_0x4dd1d2, _0x1b9063.modo, _0x1b9063.nombre);
    try {
      await __proxyAccion("correo", {
        para: _0x10ee88,
        asunto: __extAsunto([_0x32dfd5]),
        texto: __clasifTextoPeticion(_0x32dfd5)
      });
      __clasifRegistrarPeticion(_0x32dfd5, _0x4dd1d2);
      __extMarcarPedido(_0x4dd1d2);
      __guardarClasif();
      guardarGrupo(_0x1b9063.modo, _0x1b9063.nombre);
      _0x279f78("Petición externa enviada a " + _0x10ee88 + " (" + _0x4dd1d2.length + " línea" + (_0x4dd1d2.length === 1 ? "" : "s") + ").");
      render();
    } catch (_0x1da71d) {
      _0x279f78("No se pudo enviar la petición automática: " + __errorAmable(_0x1da71d) + ". Sigue disponible en Hoja de pedido → Externo.");
    }
  }
  function __planoSincronizar() {
    try {
      const _0x4a2869 = document.getElementById("hojaPlanoInput");
      const _0x440988 = _0x1ea037();
      if (!_0x4a2869 || !_0x440988 || !_0x440988.pendiente) {
        return;
      }
      if (!_0x4a2869.dataset.plano) {
        _0x4a2869.dataset.plano = "1";
        _0x4a2869.addEventListener("change", () => {
          const _0x15bca7 = _0x1ea037();
          if (!_0x15bca7 || !_0x15bca7.pendiente) {
            return;
          }
          _0x15bca7.pendiente.plano = _0x4a2869.value.trim();
          guardarGrupo(estado.mode, estado.current[estado.mode]);
        });
      }
      if (document.activeElement !== _0x4a2869) {
        _0x4a2869.value = _0x440988.pendiente.plano || "";
      }
    } catch (_0x4b3a94) {}
  }
  function __clasifDescargar(_0x239706, _0x5847f6, _0xad84ee) {
    if (typeof XLSX === "undefined") {
      _0x279f78("No se pudo generar el archivo: falta la librería de Excel (¿sin conexión?).");
      return;
    }
    const _0x1056f1 = __clasifStore();
    const _0x1d286e = Object.fromEntries(__CLASIF_EXT);
    const _0x22936c = _0x5847f6.map(_0x597928 => {
      const _0x104e5c = {
        "Nº de plano": __clasifPlanoDe(estado.mode, _0xad84ee),
        OT: _0xad84ee,
        Fecha: __pedidoFechaTexto(_0x597928.fecha) || _0x597928.fechaGuardado || "",
        Código: _0x597928.code || "",
        Artículo: _0x597928.code ? _0x597928.desc || "" : _0x597928.textoLibre || _0x597928.textoOrig || _0x597928.desc || "",
        Referencia: _0x597928.referencia || "",
        Cantidad: parseInt(_0x597928.qty, 10) || 1,
        Reserva: _0x597928.reserva || 0
      };
      if (_0x239706 === "externo") {
        const _0x22ba26 = _0x1056f1.peticiones.find(_0x4558d4 => _0x4558d4.id === _0x597928.extPeticion);
        _0x104e5c.Destino = _0x1d286e[_0x597928.extDestino] || "";
        _0x104e5c.Petición = _0x22ba26 ? __clasifFecha(_0x22ba26.ts) : "";
      } else {
        _0x104e5c.Etiqueta = _0x597928.tipo === "pequeno" ? "Pequeño material" : "";
      }
      return _0x104e5c;
    });
    const _0x3c2588 = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(_0x3c2588, XLSX.utils.json_to_sheet(_0x22936c), _0x239706 === "externo" ? "Externo" : "Interno");
    XLSX.writeFile(_0x3c2588, "listado_" + _0x239706 + "_" + String(_0xad84ee).replace(/[^\w.-]+/g, "_") + "_" + new Date().toISOString().slice(0, 10) + ".xlsx");
  }
  function __clasifFilaHtml(_0x1b87c3) {
    const _0x4492c4 = _0x1d1ab0;
    const _0x134c4c = parseInt(_0x1b87c3.it.qty, 10) || 1;
    const _0x4ccb23 = _0x1b87c3.est === "sin" && _0x1b87c3.c.tipo ? _0x1b87c3.c.tipo : "";
    const _0x1e3af4 = _0x1b87c3.est !== "sin" ? "" : _0x4ccb23 ? "Propuesta: <strong>" + (__TIPOS_MATERIAL.find(_0x5b983f => _0x5b983f[0] === _0x4ccb23) || ["", ""])[1] + "</strong>. " + (_0x1b87c3.c.ia ? "Sugerencia de la IA." : __CLASIF_ORIGEN[_0x1b87c3.c.origen] || "") : "Elegir el destino.";
    const _0x5f019f = __TIPOS_MATERIAL.map(_0x17d107 => "<button type=\"button\" data-tipo=\"" + _0x17d107[0] + "\" class=\"" + (_0x1b87c3.est !== "sin" && _0x1b87c3.c.tipo === _0x17d107[0] ? "on" : _0x4ccb23 === _0x17d107[0] ? "sug" : "") + "\">" + _0x17d107[1] + "</button>").join("");
    const _0x4894a3 = _0x1b87c3.est === "externo" ? "<div class=\"clasif-seg\" data-ext-id=\"" + _0x4492c4(_0x1b87c3.it.id) + "\">" + __CLASIF_EXT.map(_0x431404 => "<button type=\"button\" data-ext=\"" + _0x431404[0] + "\" class=\"" + (_0x1b87c3.it.extDestino === _0x431404[0] ? "on" : "") + "\">" + _0x431404[1] + "</button>").join("") + "</div>" : "";
    return "<div class=\"clasif-fila\"><div class=\"clasif-desc\">" + _0x4492c4(__clasifNombreLinea(_0x1b87c3.it)) + " <small>×" + _0x134c4c + (_0x1b87c3.it.fecha ? " · " + __pedidoFechaTexto(_0x1b87c3.it.fecha) : "") + "</small>" + (_0x1b87c3.c.ia ? " <span class=\"clasif-tag\">IA</span>" : "") + (_0x1b87c3.c.auto ? " <span class=\"clasif-tag\">Auto</span>" : "") + (_0x1b87c3.c.auto ? "<br><small>Clasificada sola: " + __CLASIF_ORIGEN[_0x1b87c3.c.origen] + " Pulsar otro destino para moverla.</small>" : "") + (_0x1b87c3.est === "externo" && !_0x1b87c3.it.extDestino ? "<br><small>Destino sin indicar (opcional).</small>" : "") + (_0x1e3af4 ? "<br><small>" + _0x1e3af4 + "</small>" : "") + "</div><div class=\"clasif-seg\" data-clasif-id=\"" + _0x4492c4(_0x1b87c3.it.id) + "\">" + _0x5f019f + "</div>" + _0x4894a3 + "</div>";
  }
  let __extAbierto = false;
  function __clasifCorreoGlobal() {
    try {
      const _0x45f6ef = document.getElementById("clasifCorreoGlobal");
      if (_0x45f6ef) {
        _0x45f6ef.remove();
      }
      // El correo de material externo es de las órdenes: no pinta nada en Mantenimiento ni en otras secciones
      if (_0x2df77d() !== "almacen" || estado.mode !== "montaje" && estado.mode !== "proyecto") {
        const _0x5dc119 = document.getElementById("correoOverlay");
        if (_0x5dc119) {
          _0x5dc119.remove();
        }
        return;
      }
      const _0x50fd89 = document.querySelector(".project-bar");
      if (!_0x50fd89) {
        return;
      }
      const _0x1131c5 = __extGrupos();
      const _0x477672 = __clasifStore();
      const _0x54a9bd = _0x1d1ab0;
      const _0x544ece = document.createElement("div");
      _0x544ece.className = "panel";
      _0x544ece.id = "clasifCorreoGlobal";
      _0x544ece.style.marginTop = "14px";
      const _0x2e5ab4 = document.createElement("button");
      _0x2e5ab4.type = "button";
      _0x2e5ab4.className = "cam-btn";
      _0x2e5ab4.style.width = "100%";
      _0x2e5ab4.textContent = "Correo de material externo · " + (_0x1131c5.length ? _0x1131c5.length + " listado" + (_0x1131c5.length === 1 ? "" : "s") + " pendiente" + (_0x1131c5.length === 1 ? "" : "s") : "nada pendiente");
      _0x2e5ab4.addEventListener("click", () => {
        __extAbierto = true;
        __clasifConservarVista();
      });
      _0x544ece.appendChild(_0x2e5ab4);
      const _0x26adc6 = document.createElement("div");
      if (__extAbierto && !_0x1131c5.length) {
        const _0x2d11aa = document.createElement("p");
        _0x2d11aa.style.cssText = "font-size:12.5px; color:var(--text-muted); margin:12px 0 0;";
        _0x2d11aa.textContent = "No hay líneas asignadas a Externo pendientes de pedir. Para que aparezcan aquí: abrir la orden, ir a Hoja de pedido y asignar la línea a Externo en «Revisar pedido».";
        _0x26adc6.appendChild(_0x2d11aa);
      } else if (__extAbierto) {
        const _0x41f73e = document.createElement("div");
        _0x41f73e.style.marginTop = "12px";
        const _0x5ab490 = "";
        {
          const _0x29884e = _0x1131c5.filter(_0xa4b0d1 => !__extExcluidos.has(_0xa4b0d1.clave));
          const _0x4a9285 = _0x29884e.map(_0x187095 => ({
            pet: __clasifNuevaPeticion(_0x187095.items, _0x187095.modo, _0x187095.nombre),
            g: _0x187095
          }));
          const _0x3c2457 = _0x4a9285.length ? __clasifTextoCorreo(_0x4a9285.map(_0xa58cfe => _0xa58cfe.pet)) : "";
          const _0x3b9bed = _0x4a9285.filter(_0x5a7266 => !_0x5a7266.pet.plano).length;
          _0x41f73e.innerHTML = _0x5ab490 + "<p style=\"font-size:12px; color:var(--text-muted); margin:0 0 8px;\">Listados externos pendientes de pedir, de todas las órdenes. Los marcados van en el mismo correo, cada uno identificado por su número de plano.</p><div id=\"extGrupos\">" + _0x1131c5.map(_0x16d093 => {
            const _0x4ae681 = __clasifPlanoDe(_0x16d093.modo, _0x16d093.nombre);
            return "<div data-ext-grupo=\"" + _0x54a9bd(_0x16d093.clave) + "\" style=\"border-top:1px dashed var(--border); padding:10px 0;\"><div style=\"display:flex; gap:8px; align-items:center;\"><input type=\"checkbox\" data-ext-sel" + (__extExcluidos.has(_0x16d093.clave) ? "" : " checked") + " style=\"width:20px; height:20px; flex:none;\"><div style=\"flex:1; min-width:0;\"><strong>" + _0x54a9bd(_0x16d093.nombre) + "</strong> <small>· " + _0x16d093.items.length + " línea" + (_0x16d093.items.length === 1 ? "" : "s") + "</small></div><input type=\"text\" data-ext-plano value=\"" + _0x54a9bd(_0x4ae681) + "\" placeholder=\"Nº de plano\" style=\"width:120px; flex:none; margin:0;\"></div><div style=\"font-size:12px; color:var(--text-muted); margin:6px 0 0 28px;\">" + _0x16d093.items.map(_0x16e086 => _0x54a9bd(__clasifNombreLinea(_0x16e086)) + " ×" + (parseInt(_0x16e086.qty, 10) || 1)).join(" · ") + "</div></div>";
          }).join("") + "</div><div class=\"scanner-row\" style=\"margin-top:6px;\"><button type=\"button\" class=\"cam-btn\" id=\"extTodosBtn\" style=\"flex:1;\">Marcar todos</button><button type=\"button\" class=\"cam-btn\" id=\"extNingunoBtn\" style=\"flex:1;\">Quitar todos</button></div>";
          if (_0x4a9285.length) {
            _0x41f73e.insertAdjacentHTML("beforeend", "<p style=\"font-size:12px; color:var(--text-muted); margin:12px 0 6px;\">Texto del correo" + (_0x3b9bed ? " <span style=\"color:var(--danger,#ff6b6b);\">· " + _0x3b9bed + " listado" + (_0x3b9bed === 1 ? "" : "s") + " sin número de plano</span>" : "") + "</p><textarea data-clasif-texto readonly rows=\"" + Math.min(16, _0x3c2457.split("\n").length + 1) + "\" style=\"font-size:12.5px;\"></textarea><div id=\"extCorreoCampo\"></div><div style=\"position:sticky; bottom:-14px; background:var(--bg-panel); border-top:1px solid var(--border); margin-top:12px; padding:10px 0 14px;\"><div style=\"display:flex; gap:8px;\"><button type=\"button\" class=\"cam-btn\" id=\"clasifCopiarBtn\" style=\"flex:1;\">Copiar texto</button><button type=\"button\" class=\"btn primary\" id=\"clasifCorreoBtn\" style=\"flex:1;\">Abrir correo</button></div><button type=\"button\" class=\"btn primary\" id=\"clasifEnviarBtn\" style=\"width:100%; margin-top:8px;\">Enviar correo automáticamente</button></div>");
            _0x41f73e.querySelector("[data-clasif-texto]").value = _0x3c2457;
            const _0x4978bd = __correoCampo();
            const _0x1c0b9a = _0x4978bd.entrada;
            _0x41f73e.querySelector("#extCorreoCampo").appendChild(_0x4978bd.nodo);
            const _0x250556 = __extAsunto(_0x4a9285.map(_0x3f127e => _0x3f127e.pet));
            _0x41f73e.querySelector("#clasifCopiarBtn").addEventListener("click", () => {
              __clasifCopiar(_0x3c2457);
              __extRegistrar(_0x4a9285);
              __extAbierto = false;
              __clasifConservarVista();
            });
            _0x41f73e.querySelector("#clasifCorreoBtn").addEventListener("click", () => {
              _0x477672.email = _0x1c0b9a.value.trim();
              __clasifAbrirCorreo(_0x3c2457, _0x250556);
              __extRegistrar(_0x4a9285);
              __extAbierto = false;
              __clasifConservarVista();
            });
            const _0x394528 = _0x41f73e.querySelector("#clasifEnviarBtn");
            _0x394528.addEventListener("click", async () => {
              const _0x2cec51 = _0x1c0b9a.value.trim();
              if (!_0x2cec51) {
                _0x279f78("Indicar el correo de destino.");
                return;
              }
              _0x477672.email = _0x2cec51;
              _0x394528.disabled = true;
              _0x394528.textContent = "Enviando…";
              try {
                await __proxyAccion("correo", {
                  para: _0x2cec51,
                  asunto: _0x250556,
                  texto: _0x3c2457
                });
                __extRegistrar(_0x4a9285);
                _0x279f78("Correo enviado a " + _0x2cec51 + ".");
                __extAbierto = false;
                __clasifConservarVista();
              } catch (_0x2c4476) {
                _0x394528.disabled = false;
                _0x394528.textContent = "Enviar correo automáticamente";
                _0x279f78("No se pudo enviar: " + __errorAmable(_0x2c4476) + ". Se puede usar «Abrir correo».");
              }
            });
          } else {
            _0x41f73e.insertAdjacentHTML("beforeend", "<p style=\"font-size:12.5px; color:var(--text-faint); margin:12px 0 0;\">Marcar al menos un listado para preparar el correo.</p>");
          }
          _0x41f73e.querySelectorAll("[data-ext-sel]").forEach(_0x378ac8 => _0x378ac8.addEventListener("change", () => {
            const _0x5d35dd = _0x378ac8.closest("[data-ext-grupo]").getAttribute("data-ext-grupo");
            if (_0x378ac8.checked) {
              __extExcluidos.delete(_0x5d35dd);
            } else {
              __extExcluidos.add(_0x5d35dd);
            }
            __clasifConservarVista();
          }));
          _0x41f73e.querySelectorAll("[data-ext-plano]").forEach(_0x301a9e => _0x301a9e.addEventListener("change", () => {
            const _0xfdf492 = _0x1131c5.find(_0x368681 => _0x368681.clave === _0x301a9e.closest("[data-ext-grupo]").getAttribute("data-ext-grupo"));
            if (!_0xfdf492) {
              return;
            }
            _0xfdf492.grupo.pendiente.plano = _0x301a9e.value.trim();
            guardarGrupo(_0xfdf492.modo, _0xfdf492.nombre);
            __clasifConservarVista();
          }));
          _0x41f73e.querySelector("#extTodosBtn").addEventListener("click", () => {
            __extExcluidos.clear();
            __clasifConservarVista();
          });
          _0x41f73e.querySelector("#extNingunoBtn").addEventListener("click", () => {
            _0x1131c5.forEach(_0x2786a8 => __extExcluidos.add(_0x2786a8.clave));
            __clasifConservarVista();
          });
        }
        _0x26adc6.appendChild(_0x41f73e);
      }
      _0x50fd89.parentNode.insertBefore(_0x544ece, _0x50fd89.nextSibling);
      const _0x423c59 = document.getElementById("correoOverlay");
      const _0x151ce8 = _0x423c59 && _0x423c59.firstChild ? _0x423c59.firstChild.scrollTop : 0;
      if (_0x423c59) {
        _0x423c59.remove();
      }
      if (__extAbierto) {
        const _0x1ac11d = document.createElement("div");
        _0x1ac11d.id = "correoOverlay";
        _0x1ac11d.style.cssText = "position:fixed; inset:0; background:rgba(0,0,0,.7); display:flex; align-items:center; justify-content:center; z-index:998; padding:16px;";
        const _0x5f43f3 = document.createElement("div");
        _0x5f43f3.className = "panel";
        _0x5f43f3.style.cssText = "max-width:560px; width:100%; max-height:90vh; overflow-y:auto; margin:0;";
        _0x5f43f3.innerHTML = "<div style=\"display:flex; align-items:center; gap:10px; margin-bottom:12px;\"><p class=\"panel-title\" style=\"flex:1; margin:0;\">Correo de material externo</p><button type=\"button\" class=\"cam-btn\" id=\"correoCerrarBtn\" style=\"flex:none; width:auto; padding:6px 14px;\">Cerrar</button></div>";
        _0x5f43f3.appendChild(_0x26adc6);
        _0x1ac11d.appendChild(_0x5f43f3);
        const _0x3fbe57 = () => {
          __extAbierto = false;
          __clasifConservarVista();
        };
        _0x5f43f3.querySelector("#correoCerrarBtn").addEventListener("click", _0x3fbe57);
        _0x1ac11d.addEventListener("click", _0x2b3c83 => {
          if (_0x2b3c83.target === _0x1ac11d) {
            _0x3fbe57();
          }
        });
        document.body.appendChild(_0x1ac11d);
        _0x5f43f3.scrollTop = _0x151ce8;
      }
    } catch (_0x2c4c93) {}
  }
  function __clasifPanelAlmacen() {
    try {
      document.querySelectorAll("#clasifSwitch,#clasifRevision,#clasifAutoPanel,#clasifIaPanel,#clasifAsocPanel,#clasifPanel,#clasifInterno,#clasifPeticion").forEach(_0x5f098d => _0x5f098d.remove());
      if (_0x2df77d() !== "almacen") {
        return;
      }
      if (estado.mode !== "montaje" && estado.mode !== "proyecto") {
        return;
      }
      const _0x43b034 = document.getElementById("saveHojaPedidoBtn");
      if (!_0x43b034) {
        return;
      }
      const _0x24bcb5 = _0x43b034.closest(".ticket") || _0x43b034.closest(".panel");
      const _0x5abd1c = _0x1ea037();
      if (!_0x24bcb5 || !_0x5abd1c || !_0x5abd1c.pendiente) {
        return;
      }
      const _0x321478 = _0x5abd1c.pendiente.items || [];
      if (!_0x321478.length) {
        return;
      }
      if (__clasifAutoRefs(_0x321478)) {
        _0x279f78("Referencias asignadas por coincidencia. Pendientes de validar.");
        __clasifGuardarPronto();
        setTimeout(render, 0);
        return;
      }
      const _0x55d344 = _0x1d1ab0;
      const _0x1f3544 = estado.current[estado.mode] || "";
      const _0x594412 = estado.mode + "|" + _0x1f3544;
      const _0x166b15 = __clasifStore();
      const _0x4d2ea1 = _0x321478.map(_0x3ff5e0 => {
        const _0x42c885 = __clasifLinea(_0x3ff5e0);
        return {
          it: _0x3ff5e0,
          c: _0x42c885,
          est: __clasifEstado(_0x42c885)
        };
      });
      if (_0x594412 !== __clasifVistaClave) {
        __clasifVista = _0x4d2ea1.some(_0x396278 => _0x396278.est === "sin") ? "sin" : "interno";
        __clasifVistaClave = _0x594412;
      } else if (_0x4d2ea1.filter(_0x49f982 => _0x49f982.est === "sin").length > __clasifSinPrevio) {
        __clasifVista = "sin";
      }
      __clasifSinPrevio = _0x4d2ea1.filter(_0x170928 => _0x170928.est === "sin").length;
      const _0x2400d7 = __clasifVista;
      const _0x1d7fa6 = {
        sin: 0,
        interno: 0,
        externo: 0
      };
      _0x4d2ea1.forEach(_0x19ccfa => {
        _0x1d7fa6[_0x19ccfa.est]++;
      });
      const _0x3642a6 = _0x4d2ea1.filter(_0x4f43cf => _0x4f43cf.est === _0x2400d7);
      const _0x12ae56 = document.createElement("div");
      _0x12ae56.style.marginBottom = "14px";
      _0x12ae56.id = "clasifSwitch";
      _0x12ae56.innerHTML = "<div class=\"clasif-seg clasif-vista\">" + __CLASIF_VISTAS.map(_0x705524 => "<button type=\"button\" class=\"" + (_0x2400d7 === _0x705524[0] ? "on" : "") + "\" data-vista=\"" + _0x705524[0] + "\">" + _0x705524[1] + " (" + _0x1d7fa6[_0x705524[0]] + ")</button>").join("") + "</div>" + (_0x2400d7 === "sin" ? "" : "<button type=\"button\" class=\"btn primary\" data-clasif-descargar style=\"width:100%; margin-top:10px;\">Descargar listado " + _0x2400d7 + " de esta orden (Excel)</button>") + (_0x2400d7 === "sin" ? "" : "<p style=\"font-size:11.5px; color:var(--text-faint); margin:8px 0 0;\">" + (_0x2400d7 === "externo" ? "Solo las líneas externas entran en la petición. Se pueden mover a otro destino en cualquier momento." : "Líneas Interno y Pequeño material. Se pueden mover a otro destino en cualquier momento.") + "</p>");
      _0x12ae56.querySelectorAll("[data-vista]").forEach(_0x2c3856 => _0x2c3856.addEventListener("click", () => {
        __clasifVista = _0x2c3856.getAttribute("data-vista");
        __clasifConservarVista();
      }));
      const _0x41aead = _0x12ae56.querySelector("[data-clasif-descargar]");
      if (_0x41aead) {
        _0x41aead.addEventListener("click", () => {
          const _0x47ccc7 = _0x3642a6.map(_0x38b6cc => _0x38b6cc.it);
          if (!_0x47ccc7.length) {
            _0x279f78("No hay líneas en este listado.");
            return;
          }
          __clasifDescargar(_0x2400d7, _0x47ccc7, _0x1f3544);
        });
      }
      let _0x5682fb = _0x24bcb5;
      const _0x2760f4 = _0x2a2ee9 => {
        _0x5682fb.parentNode.insertBefore(_0x2a2ee9, _0x5682fb.nextSibling);
        _0x5682fb = _0x2a2ee9;
      };
      const _0x57de9e = document.createElement("div");
      _0x57de9e.className = "panel";
      _0x57de9e.id = "clasifRevision";
      _0x57de9e.style.marginTop = "14px";
      _0x57de9e.innerHTML = "<p class=\"panel-title\">Revisar pedido</p>";
      _0x57de9e.appendChild(_0x12ae56);
      _0x2760f4(_0x57de9e);
      const _0x56a2ba = _0x3642a6.filter(_0x58d760 => _0x58d760.it.refAuto).map(_0x13decc => _0x13decc.it);
      if (_0x56a2ba.length) {
        const _0x4306e6 = document.createElement("div");
        _0x4306e6.className = "clasif-sec";
        _0x4306e6.id = "clasifAutoPanel";
        _0x4306e6.innerHTML = "<p class=\"panel-title\">Referencias asignadas por coincidencia</p><p style=\"font-size:12px; color:var(--text-muted); margin:0 0 6px;\">Coincidencia exacta con un código del stock o con una asociación ya validada varias veces. «Deshacer» devuelve el texto original.</p>" + _0x56a2ba.map(_0x93c3ad => "<div class=\"clasif-fila\"><div class=\"clasif-desc\"><em>" + _0x55d344(_0x93c3ad.textoOrig) + "</em> <small>×" + (parseInt(_0x93c3ad.qty, 10) || 1) + "</small><br><small>Asignada: <strong>" + _0x55d344(_0x93c3ad.code) + "</strong> — " + _0x55d344(_0x93c3ad.desc || "") + "</small></div><div class=\"clasif-seg\" data-auto-id=\"" + _0x55d344(_0x93c3ad.id) + "\"><button type=\"button\" class=\"on\" data-auto=\"si\">Validar</button><button type=\"button\" data-auto=\"no\">Deshacer</button></div></div>").join("") + (_0x56a2ba.length > 1 ? "<button type=\"button\" class=\"cam-btn\" id=\"clasifAutoTodasBtn\" style=\"width:100%; margin-top:10px;\">Validar las " + _0x56a2ba.length + " referencias</button>" : "");
        _0x4306e6.querySelectorAll(".clasif-seg button").forEach(_0x411a44 => _0x411a44.addEventListener("click", () => {
          const _0x10f605 = _0x56a2ba.find(_0x25f5a7 => _0x25f5a7.id === _0x411a44.parentNode.getAttribute("data-auto-id"));
          if (!_0x10f605) {
            return;
          }
          if (_0x411a44.getAttribute("data-auto") === "si") {
            __clasifValidarRef(_0x5abd1c, _0x10f605);
          } else {
            __clasifDeshacerRef(_0x10f605);
          }
          __clasifGuardarPronto();
          if (_0x411a44.getAttribute("data-auto") === "no") {
            render();
          } else {
            __clasifConservarVista();
          }
        }));
        const _0x971027 = _0x4306e6.querySelector("#clasifAutoTodasBtn");
        if (_0x971027) {
          _0x971027.addEventListener("click", () => {
            _0x56a2ba.forEach(_0x308d66 => __clasifValidarRef(_0x5abd1c, _0x308d66));
            __clasifGuardarPronto();
            __clasifConservarVista();
          });
        }
        _0x57de9e.appendChild(_0x4306e6);
      }
      const _0x2b9d0f = _0x2400d7 === "sin" ? _0x3642a6.filter(_0x49ce59 => _0x49ce59.it.textoLibre).map(_0x37a1f6 => ({
        it: _0x37a1f6.it,
        s: __clasifRefSugerida(_0x37a1f6.it)
      })).filter(_0x163b1b => _0x163b1b.s) : [];
      if (_0x2b9d0f.length) {
        const _0x56c4fa = document.createElement("div");
        _0x56c4fa.className = "clasif-sec";
        _0x56c4fa.id = "clasifAsocPanel";
        _0x56c4fa.innerHTML = "<p class=\"panel-title\">Referencias sugeridas</p><p style=\"font-size:12px; color:var(--text-muted); margin:0 0 6px;\">Líneas escritas a mano que se parecen a una referencia del stock. Solo se asignan si se confirma.</p>" + _0x2b9d0f.map(_0x575282 => "<div class=\"clasif-fila\"><div class=\"clasif-desc\"><em>" + _0x55d344(_0x575282.it.textoLibre) + "</em> <small>×" + (parseInt(_0x575282.it.qty, 10) || 1) + "</small><br><small>Sugerida: <strong>" + _0x55d344(_0x575282.s.cat.code) + "</strong> — " + _0x55d344(_0x575282.s.cat.desc || "") + "</small>" + (_0x575282.s.ia ? " <span class=\"clasif-tag\">IA</span>" : "") + "</div><div class=\"clasif-seg\" data-asoc-id=\"" + _0x55d344(_0x575282.it.id) + "\"><button type=\"button\" class=\"on\" data-asoc=\"si\">Confirmar</button><button type=\"button\" data-asoc=\"no\">No es</button></div></div>").join("") + (_0x2b9d0f.length > 1 ? "<button type=\"button\" class=\"cam-btn\" id=\"clasifAsocTodasBtn\" style=\"width:100%; margin-top:10px;\">Confirmar las " + _0x2b9d0f.length + " referencias sugeridas</button>" : "");
        _0x56c4fa.querySelectorAll(".clasif-seg button").forEach(_0x3ea7e3 => _0x3ea7e3.addEventListener("click", () => {
          const _0x4c3ee2 = _0x2b9d0f.find(_0x1adac6 => _0x1adac6.it.id === _0x3ea7e3.parentNode.getAttribute("data-asoc-id"));
          if (!_0x4c3ee2) {
            return;
          }
          if (_0x3ea7e3.getAttribute("data-asoc") === "si") {
            __clasifAsignarRef(_0x5abd1c, _0x4c3ee2.it, _0x4c3ee2.s.cat);
          } else {
            _0x4c3ee2.it.asocRechazada = _0x4c3ee2.s.cat.code;
          }
          __clasifGuardarPronto();
          __clasifConservarVista();
        }));
        const _0x3f51e4 = _0x56c4fa.querySelector("#clasifAsocTodasBtn");
        if (_0x3f51e4) {
          _0x3f51e4.addEventListener("click", () => {
            _0x2b9d0f.forEach(_0x1d20a1 => __clasifAsignarRef(_0x5abd1c, _0x1d20a1.it, _0x1d20a1.s.cat));
            __clasifGuardarPronto();
            __clasifConservarVista();
          });
        }
        _0x57de9e.appendChild(_0x56c4fa);
      }
      const _0x1e4a57 = document.createElement("div");
      _0x1e4a57.className = "clasif-sec";
      _0x1e4a57.id = "clasifPanel";
      const _0x94ce6b = _0x3642a6.filter(_0x67e4f3 => _0x67e4f3.c.tipo && !_0x67e4f3.c.ok);
      _0x1e4a57.innerHTML = "<p class=\"panel-title\">" + (_0x2400d7 === "sin" ? "Asignar destino" : _0x2400d7 === "externo" ? "Líneas externas" : "Líneas internas") + "</p>" + (_0x3642a6.length ? _0x3642a6.map(__clasifFilaHtml).join("") : "<p style=\"font-size:12.5px; color:var(--text-faint); margin:0;\">" + (_0x2400d7 === "sin" ? "Todas las líneas tienen destino." : "No hay líneas en este listado.") + "</p>") + (_0x94ce6b.length ? "<button type=\"button\" class=\"cam-btn\" id=\"clasifPropuestasBtn\" style=\"width:100%; margin-top:10px;\">Aceptar las " + _0x94ce6b.length + " propuestas</button>" : "") + "<label style=\"display:flex; gap:8px; align-items:center; font-size:12px; color:var(--text-muted); margin-top:10px;\"><input type=\"checkbox\" id=\"clasifIaAuto\"" + (_0x166b15.ia.auto ? " checked" : "") + "> Pedir ayuda a la IA al recibir " + __IA_MIN_AUTO + " o más líneas sin detectar</label><label style=\"display:flex; gap:8px; align-items:center; font-size:12px; color:var(--text-muted); margin-top:8px;\"><input type=\"checkbox\" id=\"clasifAutoAprende\"" + (__clasifAutoActivo() ? " checked" : "") + "> Clasificar solo lo aprendido (" + __CLASIF_AUTO_MIN + " decisiones iguales y ninguna distinta)</label>";
      _0x1e4a57.querySelectorAll("[data-clasif-id] button").forEach(_0x49c13c => _0x49c13c.addEventListener("click", () => {
        const _0x4caa97 = _0x4d2ea1.find(_0xdcb004 => _0xdcb004.it.id === _0x49c13c.parentNode.getAttribute("data-clasif-id"));
        if (!_0x4caa97) {
          return;
        }
        const _0x28a55c = _0x49c13c.getAttribute("data-tipo");
        if (_0x4caa97.est !== "sin" && _0x4caa97.c.tipo === _0x28a55c) {
          return;
        }
        __clasifFijar(_0x4caa97.it, _0x28a55c);
        if (_0x4caa97.est !== "sin") {
          _0x279f78("«" + __iaCorto(__clasifNombreLinea(_0x4caa97.it), 40) + "» movida a " + (__TIPOS_MATERIAL.find(_0x19d6ee => _0x19d6ee[0] === _0x28a55c) || ["", ""])[1] + ".");
        }
        __clasifConservarVista();
      }));
      _0x1e4a57.querySelectorAll("[data-ext-id] button").forEach(_0x2540d2 => _0x2540d2.addEventListener("click", () => {
        const _0x553ce4 = _0x4d2ea1.find(_0x45b2d1 => _0x45b2d1.it.id === _0x2540d2.parentNode.getAttribute("data-ext-id"));
        if (!_0x553ce4) {
          return;
        }
        const _0x1fee81 = _0x2540d2.getAttribute("data-ext");
        if (_0x553ce4.it.extDestino === _0x1fee81) {
          delete _0x553ce4.it.extDestino;
        } else {
          _0x553ce4.it.extDestino = _0x1fee81;
        }
        __clasifGuardarPronto();
        __clasifConservarVista();
      }));
      const _0x405850 = _0x1e4a57.querySelector("#clasifPropuestasBtn");
      if (_0x405850) {
        _0x405850.addEventListener("click", () => {
          _0x94ce6b.forEach(_0xa61f3 => __clasifFijar(_0xa61f3.it, _0xa61f3.c.tipo));
          __clasifConservarVista();
        });
      }
      _0x1e4a57.querySelector("#clasifAutoAprende").addEventListener("change", _0x30b0f3 => {
        _0x166b15.autoAprende = _0x30b0f3.target.checked;
        __guardarClasif();
        __clasifConservarVista();
      });
      _0x1e4a57.querySelector("#clasifIaAuto").addEventListener("change", _0x342aef => {
        _0x166b15.ia.auto = _0x342aef.target.checked;
        __guardarClasif();
        __clasifConservarVista();
      });
      _0x57de9e.appendChild(_0x1e4a57);
      if (_0x2400d7 === "sin") {
        const _0x1cf561 = __iaPendientes(_0x321478);
        __iaAutomatico(_0x5abd1c, _0x1cf561);
        if (_0x1cf561.length) {
          const _0x1ca731 = new Date().toISOString().slice(0, 10);
          const _0x4d788e = _0x166b15.ia.dia.f === _0x1ca731 ? _0x166b15.ia.dia.n : 0;
          const _0x366885 = document.createElement("div");
          _0x366885.className = "clasif-sec";
          _0x366885.id = "clasifIaPanel";
          _0x366885.innerHTML = "<p class=\"panel-title\">Líneas sin detectar</p><p style=\"font-size:12px; color:var(--text-muted); margin:0 0 8px;\">" + _0x1cf561.length + " línea" + (_0x1cf561.length === 1 ? "" : "s") + " sin referencia ni destino claros. La IA propone una sugerencia para cada una y después se confirma. Consultas de hoy: " + _0x4d788e + "/" + __IA_MAX_DIA + ".</p><button type=\"button\" class=\"cam-btn\" data-ia-consultar style=\"width:100%;\"" + (_0x4d788e >= __IA_MAX_DIA ? " disabled" : "") + ">Preguntar a la IA (" + Math.min(_0x1cf561.length, __IA_MAX_LINEAS) + ")</button>";
          const _0x22bf3f = _0x366885.querySelector("[data-ia-consultar]");
          _0x22bf3f.addEventListener("click", async () => {
            _0x22bf3f.disabled = true;
            _0x22bf3f.textContent = "Consultando…";
            await __iaConsultar(_0x5abd1c);
            __clasifConservarVista();
          });
          _0x57de9e.appendChild(_0x366885);
        }
      }
      if (_0x2400d7 === "interno") {
        const _0x5153a6 = _0x3642a6.map(_0x3cee06 => _0x3cee06.it);
        const _0x4cf3fa = document.createElement("div");
        _0x4cf3fa.className = "panel";
        _0x4cf3fa.id = "clasifInterno";
        _0x4cf3fa.style.marginTop = "14px";
        if (_0x5153a6.length) {
          const _0x51c192 = __clasifTextoInterno(_0x5153a6);
          _0x4cf3fa.innerHTML = "<p class=\"panel-title\">Listado interno</p>" + _0x5153a6.map(_0x91f62f => "<div class=\"clasif-fila\"><div class=\"clasif-desc\">" + _0x55d344(__clasifNombreLinea(_0x91f62f)) + " <small>×" + (parseInt(_0x91f62f.qty, 10) || 1) + "</small>" + (_0x91f62f.tipo === "pequeno" ? " <span class=\"clasif-tag\">Pequeño material</span>" : "") + "</div></div>").join("") + "<button type=\"button\" class=\"cam-btn\" id=\"clasifCopiarIntBtn\" style=\"width:100%; margin-top:10px;\">Copiar listado interno</button>";
          _0x4cf3fa.querySelector("#clasifCopiarIntBtn").addEventListener("click", () => __clasifCopiar(_0x51c192));
        } else {
          _0x4cf3fa.innerHTML = "<p class=\"panel-title\">Listado interno</p><p style=\"font-size:12.5px; color:var(--text-faint); margin:0;\">Aparecerán aquí las líneas asignadas a Interno o Pequeño material (este último con su etiqueta).</p>";
        }
        _0x2760f4(_0x4cf3fa);
      }
      if (_0x2400d7 === "externo") {
        _0x57de9e.insertAdjacentHTML("beforeend", "<button type=\"button\" class=\"cam-btn\" id=\"extAbrirBtn\" style=\"width:100%; margin-top:12px;\">Preparar correo de material externo</button>");
        _0x57de9e.querySelector("#extAbrirBtn").addEventListener("click", () => {
          __extAbierto = true;
          __clasifConservarVista();
        });
        const _0x5c5586 = estado.mode === "montaje" ? "montaje" : "proyecto";
        const _0x1f47a9 = _0x166b15.peticiones.filter(_0x2c88a2 => _0x2c88a2.modo === _0x5c5586 && _0x2c88a2.orden === _0x1f3544).slice().reverse();
        if (_0x1f47a9.length) {
          const _0x12b8e9 = document.createElement("div");
          _0x12b8e9.className = "panel";
          _0x12b8e9.id = "clasifPeticion";
          _0x12b8e9.style.marginTop = "14px";
          const _0x33971e = document.createElement("div");
          _0x33971e.innerHTML = "<p class=\"eyebrow\" style=\"margin:14px 0 4px;\">Peticiones anteriores de esta orden</p>" + _0x1f47a9.map(_0x54e18d => "<div class=\"clasif-fila\"><div class=\"clasif-desc\"><strong>" + _0x55d344(__clasifFecha(_0x54e18d.ts)) + "</strong> <small>· " + _0x54e18d.lineas.length + " línea" + (_0x54e18d.lineas.length === 1 ? "" : "s") + "</small></div><div class=\"clasif-seg\" data-pet-id=\"" + _0x55d344(_0x54e18d.id) + "\"><button type=\"button\" data-pet=\"copiar\">Copiar</button><button type=\"button\" data-pet=\"anular\">Anular</button></div></div>").join("");
          _0x33971e.querySelectorAll(".clasif-seg button").forEach(_0x34032d => _0x34032d.addEventListener("click", () => {
            const _0x2c0c46 = _0x1f47a9.find(_0x2274db => _0x2274db.id === _0x34032d.parentNode.getAttribute("data-pet-id"));
            if (!_0x2c0c46) {
              return;
            }
            if (_0x34032d.getAttribute("data-pet") === "copiar") {
              __clasifCopiar(__clasifTextoPeticion(_0x2c0c46));
            } else {
              __clasifAnularPeticion(_0x2c0c46, (estado.groupData[_0x2c0c46.modo + "::" + _0x2c0c46.orden] || {
                pendiente: {
                  items: _0x321478
                }
              }).pendiente.items);
              guardarGrupo(_0x2c0c46.modo, _0x2c0c46.orden);
              __clasifConservarVista();
            }
          }));
          _0x12b8e9.appendChild(_0x33971e);
          _0x2760f4(_0x12b8e9);
        }
      }
    } catch (_0x562d36) {}
  }
  __GUIAS["chat|taller"] = "Escribe lo que hace falta, una línea por artículo (las unidades con un número, por ejemplo «test1 5»), y pulsa «Enviar». Almacén recibe el aviso.";
  __GUIAS["hoja|almacen"] = "Asigna cada línea sin clasificar a Interno, Externo o Pequeño material. Las líneas pueden moverse cuando haga falta.";
  let __trabajadorActualId = null;
  function __guardarTrabajadores() {
    guardar("trabajadores", estado.trabajadores);
  }
  async function __geminiParsearRespuesta(__resp, __crudo) {
    if (!__resp || !__resp.ok) {
      let __cuerpo = "";
      try {
        __cuerpo = await __resp.text();
      } catch (__e) {}
      throw new Error("HTTP " + (__resp ? __resp.status : "?") + " " + __cuerpo.slice(0, 200));
    }
    const __json = await __resp.json();
    if (__json && __json.error) {
      throw new Error((__json.error.message || JSON.stringify(__json.error)).toString().slice(0, 200));
    }
    const __buscar = __obj => {
      if (typeof __obj === "string") {
        const __t = __obj.trim();
        if (__t[0] !== "[" && __t[0] !== "{") {
          return null;
        }
        try {
          const __p = JSON.parse(__t);
          if (Array.isArray(__p)) {
            return __p;
          }
        } catch (__e) {}
        return null;
      }
      if (Array.isArray(__obj)) {
        for (const __v of __obj) {
          const __r = __buscar(__v);
          if (__r) {
            return __r;
          }
        }
        return null;
      }
      if (__obj && typeof __obj === "object") {
        for (const __k in __obj) {
          const __r = __buscar(__obj[__k]);
          if (__r) {
            return __r;
          }
        }
        return null;
      }
      return null;
    };
    const __plan = __buscar(__json);
    if (!__plan) {
      throw new Error("Respuesta de Gemini sin JSON reconocible");
    }
    if (__crudo) {
      return __plan;
    }
    return __plan.map(__l => ({
      desc: String(__l && (__l.desc || __l.descripcion || __l.articulo) || "").trim(),
      qty: Math.max(1, parseInt(__l && (__l.qty || __l.cantidad), 10) || 1)
    })).filter(__l => __l.desc);
  }
  let __geminiAbortCtrl = null;
  async function __geminiExtraerMaterial(__paginas, __instrucciones) {
    if (__geminiAbortCtrl) {
      __geminiAbortCtrl.abort();
    }
    __geminiAbortCtrl = new AbortController();
    const __reglas = "Albarán o listado de material de un almacén industrial (" + __paginas.length + " página(s)). Transcribe cada línea de artículo tal como está escrita. Devuelve SOLO un array JSON [{\"desc\":\"texto del artículo\",\"qty\":número}]. Reglas: solo líneas de artículo con su cantidad (nunca cabeceras, totales, direcciones, datos fiscales, firmas, sellos, fechas, números de pedido u observaciones); qty es el número de la columna de cantidad de esa línea (1 solo si no tiene ninguno); una línea del documento es un elemento, sin dividir ni combinar; no añadas nada que no esté escrito.";
    const __instruccionesLimpias = (__instrucciones || "").trim();
    const __prompt = __instruccionesLimpias ? __reglas + " Instrucción del usuario para esta página, sin incumplir las reglas: \"" + __instruccionesLimpias + "\"." : __reglas;
    const __partesImagen = (await Promise.all(__paginas.map(__geminiReducirImagen))).filter(Boolean);
    if (!__partesImagen.length) {
      throw new Error("Sin imágenes válidas para enviar a Gemini");
    }
    const __resp = await __proxyFetch({
      prompt: __prompt,
      imagenes: __partesImagen
    }, __geminiAbortCtrl.signal);
    return await __geminiParsearRespuesta(__resp);
  }
  async function _0x469a3d() {
    if (!_0xb33f4f.length) {
      return false;
    }
    const _0xc2ad79 = $("#docScanProveedor").value;
    if (!_0xc2ad79) {
      $("#docScanStatus").textContent = "Elige antes el proveedor del material.";
      return false;
    }
    const _0x19d0b2 = _0x1ea037();
    if (!_0x19d0b2) {
      return false;
    }
    $("#docScanStatus").textContent = "Reconociendo el texto de la página 1 de " + _0xb33f4f.length + "…";
    $("#docScanStatus").classList.add("analizando");
    const __barraProg = $("#docScanProgressBar");
    if (__barraProg) {
      __barraProg.className = "progress-bar activa indeterminada";
      const __fillProg = $("#docScanProgressFill");
      if (__fillProg) {
        __fillProg.style.width = "";
      }
    }
    try {
      $("#docScanStatus").textContent = "Analizando con Gemini…";
      let _0x2558d8;
      try {
        _0x2558d8 = await __geminiExtraerMaterial(_0xb33f4f, (() => {
          const __elInstr = $("#docScanInstrucciones");
          if (__elInstr) {
            return __elInstr.value;
          } else {
            return "";
          }
        })());
      } catch (__errGemini) {
        if (__errGemini && __errGemini.name === "AbortError") {
          return false;
        }
        $("#docScanStatus").textContent = "Gemini no ha respondido (" + (__errGemini && __errGemini.message ? __errGemini.message : "error") + ") — usando reconocimiento local…";
        await _0x46a074();
        let _0x5212d3 = "";
        const __barraProgTess = $("#docScanProgressBar");
        if (__barraProgTess) {
          __barraProgTess.className = "progress-bar activa determinada";
        }
        for (let _0x10c746 = 0; _0x10c746 < _0xb33f4f.length; _0x10c746++) {
          const __fillProgTess = $("#docScanProgressFill");
          if (__fillProgTess) {
            __fillProgTess.style.width = Math.round(_0x10c746 / _0xb33f4f.length * 100) + "%";
          }
          $("#docScanStatus").textContent = "Reconociendo el texto de la página " + (_0x10c746 + 1) + " de " + _0xb33f4f.length + "…";
          const {
            data: _0x44d7bd
          } = await Tesseract.recognize(_0xb33f4f[_0x10c746].url, "spa");
          _0x5212d3 += _0x44d7bd.text + "\n";
        }
        const __fillProgTessFin = $("#docScanProgressFill");
        if (__fillProgTessFin) {
          __fillProgTessFin.style.width = "100%";
        }
        _0x2558d8 = _0x4b6c29(_0x5212d3);
      }
      if (!_0x2558d8.length) {
        $("#docScanStatus").textContent = "No he podido reconocer ninguna línea con forma de material — prueba con más luz o más cerca.";
        return false;
      }
      const _0x23da8c = _0x2558d8.map(_0x24ec14 => ({
        id: nuevoId(),
        texto: _0x24ec14.desc,
        cantidad: _0x24ec14.qty,
        codigoSugerido: estado.ocrAprendizaje[_0x24ec14.desc.toLowerCase()] || ""
      }));
      const __normalizarOCR = __s => (__s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
      const __similarOCR = (__a, __b) => {
        const __wa = __normalizarOCR(__a).split(" ").filter(Boolean);
        const __wb = new Set(__normalizarOCR(__b).split(" ").filter(Boolean));
        if (!__wa.length || !__wb.size) {
          return 0;
        }
        let __hit = 0;
        __wa.forEach(__w => {
          if (__wb.has(__w)) {
            __hit++;
          }
        });
        return __hit / Math.max(__wa.length, __wb.size);
      };
      const __lineasProveedorPend = (_0x19d0b2.pendiente.items || []).filter(__it => __it.destino === "proveedor");
      const __matchesProveedor = __lineasProveedorPend.map(__linea => {
        const __texto = __linea.textoLibre || __linea.desc || "";
        let __mejor = null;
        let __mejorScore = 0;
        _0x2558d8.forEach(__r => {
          const __sc = __similarOCR(__texto, __r.desc);
          if (__sc > __mejorScore) {
            __mejorScore = __sc;
            __mejor = __r;
          }
        });
        return {
          id: __linea.id,
          texto: __texto,
          cantidadPedida: __linea.reserva || __linea.qty || 0,
          cantidadDetectada: __mejor && __mejorScore >= 0.4 ? __mejor.qty || __linea.reserva || 0 : 0
        };
      });
      _0x1a8185 = {
        plan: _0x23da8c,
        proveedor: _0xc2ad79,
        proveedorLineas: __matchesProveedor
      };
      render();
      return true;
    } catch (_0x4fb7b6) {
      $("#docScanStatus").textContent = "Error reconociendo el texto: " + _0x4fb7b6.message;
      return false;
    } finally {
      const __elStatusFin = $("#docScanStatus");
      if (__elStatusFin) {
        __elStatusFin.classList.remove("analizando");
      }
      const __barraFin = $("#docScanProgressBar");
      if (__barraFin) {
        __barraFin.className = "progress-bar";
      }
    }
  }
  function _0xb68b() {
    if (!_0x1a8185) {
      return;
    }
    const _0x557c9d = _0x1ea037();
    if (!_0x557c9d) {
      _0x1a8185 = null;
      render();
      return;
    }
    const _0xec5e30 = $("#mainList");
    const _0x56bc73 = "Escaneo de documento — proveedor " + _0x1a8185.proveedor;
    let _0x3c68b4 = 0;
    let _0x3e7856 = 0;
    _0x1a8185.plan.forEach(_0x4a6de0 => {
      const _0xcb76c4 = _0xec5e30.querySelector("[data-ocr-codigo=\"" + _0x4a6de0.id + "\"]");
      const _0x41d783 = _0xec5e30.querySelector("[data-ocr-cantidad=\"" + _0x4a6de0.id + "\"]");
      const _0x6c5955 = _0xcb76c4 ? _0xcb76c4.value.trim() : "";
      const _0x3cc238 = Math.max(1, parseInt(_0x41d783 ? _0x41d783.value : _0x4a6de0.cantidad, 10) || 1);
      const _0x375afb = _0x6c5955 ? buscarPorCodigo(_0x6c5955) : null;
      if (_0x375afb) {
        _0x5c175f(_0x557c9d, _0x375afb, _0x3cc238, {
          proveedor: _0x1a8185.proveedor
        });
        _0x1d4277(_0x375afb, _0x3cc238, "salida", _0x56bc73);
        estado.ocrAprendizaje[_0x4a6de0.texto.toLowerCase()] = _0x375afb.code;
        _0x3c68b4++;
      } else {
        _0x557c9d.materialesFaltantes.unshift({
          id: nuevoId(),
          descripcion: _0x4a6de0.texto,
          cantidad: _0x3cc238,
          proveedor: _0x1a8185.proveedor,
          fecha: fechaHoraTexto()
        });
        _0x3e7856++;
      }
    });
    anadirMensajeChat(_0x557c9d.chat, "Documento escaneado revisado (proveedor " + _0x1a8185.proveedor + "): " + _0x3c68b4 + " servida(s)" + (_0x3e7856 ? ", " + _0x3e7856 + " marcada(s) como material faltante" : ""));
    _0x56ccc4();
    _0x29f0a4();
    (function () {
      if (_0x1a8185.proveedorLineas && _0x1a8185.proveedorLineas.length) {
        _0x1a8185.proveedorLineas.forEach(__lp => {
          const __inpRecibido = _0xec5e30.querySelector("[data-ocr-proveedor-cantidad=\"" + __lp.id + "\"]");
          const __cantRecibida = Math.max(0, parseInt(__inpRecibido ? __inpRecibido.value : __lp.cantidadDetectada, 10) || 0);
          const __itemReal = (_0x557c9d.pendiente.items || []).find(__it => __it.id === __lp.id);
          if (__itemReal) {
            __itemReal.recibidoCantidad = __cantRecibida;
            __itemReal.pendienteReclamar = __cantRecibida <= 0;
            __itemReal.avisoDevolverReserva = !!__itemReal.reserva && !!(__cantRecibida > 0);
          }
        });
      }
    })();
    _0x1a8185 = null;
    render();
    _0x279f78("Añadido a Servido: " + _0x3c68b4 + " línea(s)" + (_0x3e7856 ? ". Material faltante anotado: " + _0x3e7856 + " línea(s)" : "") + ".");
  }
  function _0x3e7902() {
    _0x1a8185 = null;
    render();
  }
  async function _0x1ed81c(_0xbfe9ae) {
    const _0xce682 = _0x1ea037();
    if (!_0xce682) {
      return;
    }
    const _0x2e75fe = _0xce682.materialesFaltantes.find(_0x1ca2b1 => _0x1ca2b1.id === _0xbfe9ae);
    if (!_0x2e75fe) {
      return;
    }
    if (!(await _0x328b69(_0xce682))) {
      return;
    }
    _0xce682.pendiente.items.push({
      id: nuevoId(),
      itemId: null,
      code: "",
      desc: "",
      referencia: "",
      textoLibre: _0x2e75fe.descripcion,
      qty: _0x2e75fe.cantidad,
      pedido: 0,
      reserva: 0
    });
    anadirMensajeChat(_0xce682.chat, "Pedido el material faltante: " + _0x2e75fe.descripcion + " (" + _0x2e75fe.cantidad + " uds, proveedor " + _0x2e75fe.proveedor + ")");
    _0xce682.materialesFaltantes = _0xce682.materialesFaltantes.filter(_0x2100ad => _0x2100ad.id !== _0xbfe9ae);
    _0x29f0a4();
    render();
  }
  async function _0x3426fa(_0x5e8a13) {
    const _0x1ad895 = _0x1ea037();
    if (!_0x1ad895) {
      return;
    }
    if (!(await _0x2cc777("¿Quitar esta línea de material faltante?"))) {
      return;
    }
    _0x1ad895.materialesFaltantes = _0x1ad895.materialesFaltantes.filter(_0x69fb40 => _0x69fb40.id !== _0x5e8a13);
    _0x29f0a4();
    render();
  }
  async function _0x49cfbe() {
    if (!_0xb33f4f.length) {
      return;
    }
    const _0x31218c = _0x1ea037();
    if (!_0x31218c) {
      return;
    }
    $("#docScanStatus").textContent = "Generando el PDF…";
    try {
      await _0x12644a();
      const {
        jsPDF: _0x4f9dfb
      } = window.jspdf;
      const _0x2dfc4e = new _0x4f9dfb({
        unit: "pt",
        format: "a4"
      });
      for (let _0x377d9d = 0; _0x377d9d < _0xb33f4f.length; _0x377d9d++) {
        if (_0x377d9d > 0) {
          _0x2dfc4e.addPage();
        }
        const _paginaActual = _0xb33f4f[_0x377d9d];
        const _0x36c6b1 = _0x2dfc4e.internal.pageSize.getWidth();
        const _0x1f035a = _0x2dfc4e.internal.pageSize.getHeight();
        const _0x30bf22 = Math.min(_0x36c6b1 / _paginaActual.w, _0x1f035a / _paginaActual.h);
        const _0x132871 = _paginaActual.w * _0x30bf22;
        const _0x4ca677 = _paginaActual.h * _0x30bf22;
        _0x2dfc4e.addImage(_paginaActual.url, "JPEG", (_0x36c6b1 - _0x132871) / 2, (_0x1f035a - _0x4ca677) / 2, _0x132871, _0x4ca677);
      }
      const _0x38b38f = _0x2dfc4e.output("datauristring");
      _0x31218c.documentos = _0x31218c.documentos || [];
      _0x31218c.documentos.unshift({
        id: nuevoId(),
        nombre: "Documento escaneado " + (_0x31218c.documentos.length + 1),
        fecha: fechaHoraTexto(),
        paginas: _0xb33f4f.length,
        dataUrl: _0x38b38f
      });
      if (_0x31218c.documentos.length > 20) {
        _0x31218c.documentos = _0x31218c.documentos.slice(0, 20);
      }
      _0x29f0a4();
      render();
      _0x279f78("PDF guardado y enlazado a esta orden/proyecto.");
    } catch (_0x57bde7) {
      $("#docScanStatus").textContent = "Error generando el PDF: " + _0x57bde7.message;
    }
  }
  $("#docScanCapturarBtn").addEventListener("click", _0x4e1af1);
  $("#docScanTerminarBtn").addEventListener("click", async () => {
    const _0xtBtn = $("#docScanTerminarBtn");
    if (!_0xb33f4f.length) {
      return;
    }
    if (!$("#docScanProveedor").value) {
      $("#docScanStatus").textContent = "Elige antes el proveedor del material.";
      return;
    }
    _0xtBtn.disabled = true;
    try {
      await _0x49cfbe();
      const __ocrOk = await _0x469a3d();
      if (__ocrOk) {
        _0xb33f4f = [];
        _0x512cbd();
      }
    } finally {
      _0xtBtn.disabled = false;
    }
  });
  $("#docScanCerrarBtn").addEventListener("click", _0x512cbd);
  (function () {
    const __btnPdf = $("#docScanSubirPdfBtn");
    const __inpPdf = $("#docScanPdfInput");
    if (__btnPdf && __inpPdf) {
      __btnPdf.addEventListener("click", () => {
        __inpPdf.click();
      });
      __inpPdf.addEventListener("change", async __ev => {
        const __file = __ev.target.files && __ev.target.files[0];
        __ev.target.value = "";
        if (__file) {
          await __subirPdfComoPaginas(__file);
        }
      });
    }
  })();
  function __capturarEstadoUI() {
    try {
      const _0xact = document.activeElement;
      let _0xfoco = null;
      if (_0xact && _0xact !== document.body && _0xact.tagName) {
        let _0xsel = null;
        if (_0xact.id) {
          _0xsel = "#" + CSS.escape(_0xact.id);
        } else if (_0xact.attributes) {
          const _0xpartes = [];
          for (const _0xat of _0xact.attributes) {
            if (_0xat.name.indexOf("data-") === 0) {
              _0xpartes.push("[" + _0xat.name + "=\"" + _0xat.value.replace(/"/g, "\"") + "\"]");
            }
          }
          if (_0xpartes.length) {
            _0xsel = _0xact.tagName.toLowerCase() + _0xpartes.join("");
          }
        }
        if (_0xsel) {
          _0xfoco = {
            selector: _0xsel,
            valor: _0xact.value !== undefined ? _0xact.value : null,
            inicioSel: typeof _0xact.selectionStart === "number" ? _0xact.selectionStart : null,
            finSel: typeof _0xact.selectionEnd === "number" ? _0xact.selectionEnd : null
          };
        }
      }
      const _0xcm = document.querySelector(".col-main");
      const _0xcs = document.querySelector(".col-side");
      const _0xdraft = {};
      try {
        document.querySelectorAll("#app input[id],#app select[id],#app textarea[id]").forEach(_0xfld => {
          try {
            if (_0xfld.type === "checkbox" || _0xfld.type === "radio") {
              _0xdraft[_0xfld.id] = {
                t: "chk",
                v: _0xfld.checked
              };
            } else if ("value" in _0xfld) {
              _0xdraft[_0xfld.id] = {
                t: "val",
                v: _0xfld.value
              };
            }
          } catch (_0xeCampo) {}
        });
      } catch (_0xeDraft) {}
      return {
        foco: _0xfoco,
        scrollY: window.scrollY,
        scrollColMain: _0xcm ? _0xcm.scrollTop : null,
        scrollColSide: _0xcs ? _0xcs.scrollTop : null,
        draft: _0xdraft
      };
    } catch (_0xe) {
      return null;
    }
  }
  function __restaurarEstadoUI(_0xestado) {
    try {
      if (!_0xestado) {
        return;
      }
      if (_0xestado.foco && _0xestado.foco.selector) {
        const _0xel = document.querySelector(_0xestado.foco.selector);
        if (_0xel) {
          if (_0xestado.foco.valor !== null && "value" in _0xel) {
            _0xel.value = _0xestado.foco.valor;
          }
          _0xel.focus();
          if (_0xestado.foco.inicioSel !== null && _0xestado.foco.finSel !== null && typeof _0xel.setSelectionRange === "function") {
            try {
              _0xel.setSelectionRange(_0xestado.foco.inicioSel, _0xestado.foco.finSel);
            } catch (_0xe2) {}
          }
        }
      }
      if (_0xestado.draft) {
        try {
          const _0xactId = document.activeElement && document.activeElement.id;
          for (const _0xid in _0xestado.draft) {
            if (_0xid === _0xactId) {
              continue;
            }
            const _0xfld = document.getElementById(_0xid);
            if (!_0xfld) {
              continue;
            }
            const _0xd = _0xestado.draft[_0xid];
            if (_0xd.t === "chk") {
              if ("checked" in _0xfld) {
                _0xfld.checked = _0xd.v;
              }
            } else if ("value" in _0xfld) {
              _0xfld.value = _0xd.v;
            }
          }
        } catch (_0xeRestoreDraft) {}
      }
      const _0xcm = document.querySelector(".col-main");
      const _0xcs = document.querySelector(".col-side");
      if (_0xcm && _0xestado.scrollColMain !== null) {
        _0xcm.scrollTop = _0xestado.scrollColMain;
      }
      if (_0xcs && _0xestado.scrollColSide !== null) {
        _0xcs.scrollTop = _0xestado.scrollColSide;
      }
      if (typeof _0xestado.scrollY === "number") {
        window.scrollTo(0, _0xestado.scrollY);
      }
    } catch (_0xe) {}
  }
  function render() {
    const __uiEstado = __capturarEstadoUI();
    const __ctxNuevo = __clasifContexto();
    if (__uiEstado && __ctxNuevo !== __clasifCtxUltimo) {
      __uiEstado.draft = null;
      if (__uiEstado.foco) {
        __uiEstado.foco.valor = null;
      }
    }
    __clasifCtxUltimo = __ctxNuevo;
    _0x474249_impl();
    __clasifPostRender();
    __restaurarEstadoUI(__uiEstado);
  }
  function _0x474249_impl() {
    if ((estado.mode === "almacen" || estado.mode === "resumen" || estado.mode === "mantenimiento") && _0x2df77d() === "taller") {
      estado.mode = "montaje";
    }
    if (estado.mode === "almacen" && _0x177050 !== "almacen") {
      _0x345037 = "entrada";
    }
    _0x177050 = estado.mode;
    const _0x28820a = document.getElementById("app");
    if (_0x28820a) {
      _0x28820a.className = "mode-" + estado.mode + (_0x28820a.classList.contains("tema-claro") ? " tema-claro" : "");
    }
    _0x2af187();
    _0x9e6851();
    _0x3536a6();
    _0x4197e5();
    const _0x169a42 = document.querySelector(".cols");
    const _0x4c5daa = $("#scannerZone");
    if (_0x169a42 && _0x4c5daa) {
      if (estado.mode === "almacen") {
        _0x169a42.parentNode.insertBefore(_0x4c5daa, _0x169a42);
      } else {
        _0x169a42.parentNode.insertBefore(_0x4c5daa, _0x169a42.nextSibling);
      }
    }
    _0x323e0f();
    if (estado.mode === "almacen") {
      _0x1c3cca();
    } else if (estado.mode === "pedido") {
      _0x4a9ee1();
    } else if (estado.mode === "mantenimiento") {
      _0x327d31();
    } else if (estado.mode === "trabajadores") {
      __renderTrabajadores();
    } else if (estado.mode === "resumen") {
      _0x3aef53();
    } else {
      _0x8db8ba();
    }
    _0xe20c0f();
    const _0x3a033d = $("#sidePanel");
    if (_0x3a033d && _0x169a42) {
      const _0x33e51a = !_0x3a033d.innerHTML.trim();
      _0x169a42.classList.toggle("cols-sin-lateral", _0x33e51a);
    }
    _0x3f1ebf();
    const _0xb1626 = $("#ubicacionesList");
    if (_0xb1626) {
      _0xb1626.innerHTML = estado.ubicaciones.map(_0x202067 => "<option value=\"" + _0x1d1ab0(_0x202067) + "\">").join("");
    }
    const _0x1bd8d0 = $("#catalogCodesList");
    if (_0x1bd8d0) {
      _0x1bd8d0.innerHTML = estado.catalog.map(_0x49ee52 => "<option value=\"" + _0x1d1ab0(_0x49ee52.code) + "\">" + _0x1d1ab0(_0x49ee52.desc) + "</option>").join("");
    }
  }
  function _0x3536a6() {
    const _0x2acddd = $("#globalSearchZone");
    if (!_0x2acddd) {
      return;
    }
    if (estado.mode === "mantenimiento" || estado.mode === "resumen") {
      _0x2acddd.innerHTML = "";
      return;
    }
    _0x2acddd.innerHTML = "\n      <div class=\"global-search\">\n        <input type=\"text\" id=\"globalStockSearch\" placeholder=\"Buscar en el stock por código o referencia…\" value=\"" + _0x1d1ab0(_0x217aa6) + "\">\n        <div id=\"globalSearchResults\"></div>\n      </div>\n    ";
    const _0x30967c = $("#globalStockSearch");
    const _0x57088a = _0x5cfc5(() => _0x3ea8d2(), 220);
    _0x30967c.addEventListener("input", _0xe72e2e => {
      _0x217aa6 = _0xe72e2e.target.value;
      _0x57088a();
    });
    _0x3ea8d2();
  }
  function _0x3ea8d2() {
    const _0x19329c = $("#globalSearchResults");
    if (!_0x19329c) {
      return;
    }
    const _0x1f564a = _0x217aa6.trim().toLowerCase();
    if (!_0x1f564a) {
      _0x19329c.innerHTML = "";
      return;
    }
    const _0x59d494 = estado.catalog.filter(_0xf0028f => _0xf0028f.code.toLowerCase().includes(_0x1f564a) || _0xf0028f.desc.toLowerCase().includes(_0x1f564a) || _0xf0028f.referencia && _0xf0028f.referencia.toLowerCase().includes(_0x1f564a));
    if (!_0x59d494.length) {
      _0x19329c.innerHTML = "<div style=\"padding:10px 4px; color:var(--text-faint); font-size:12.5px;\">Sin coincidencias en el stock.</div>";
      return;
    }
    _0x19329c.innerHTML = _0x59d494.slice(0, 15).map(_0x50e83b => "\n      <div class=\"stock-row\">\n        <div class=\"row-main\">\n          <div class=\"row-code\">" + _0x1d1ab0(_0x50e83b.code) + "</div>\n          <div class=\"row-desc\">" + _0x1d1ab0(_0x50e83b.desc) + "</div>\n        </div>\n        <div class=\"row-actions\">\n          <span class=\"stock-loc " + (_0x50e83b.location ? "set" : "unset") + "\">" + (_0x1d1ab0(_0x50e83b.location) || "Sin ubicar") + "</span>\n          <span class=\"stock-qty " + (_0x50e83b.qty > 0 ? "ok" : "low") + "\">" + _0x50e83b.qty + "</span>\n          <button class=\"cam-btn\" style=\"padding:9px 14px; font-size:13px; min-height:44px;\" data-globalsearch-qty=\"" + _0x50e83b.id + "\">Cambiar cantidad</button>\n          <button class=\"cam-btn\" style=\"padding:9px 14px; font-size:13px; min-height:44px;\" data-globalsearch-edit=\"" + _0x50e83b.id + "\">" + _0x56ae2b("editar") + "Editar</button>\n        </div>\n      </div>\n    ").join("") + (_0x59d494.length > 15 ? "<div style=\"padding:6px 4px; color:var(--text-faint); font-size:11.5px;\">+" + (_0x59d494.length - 15) + " más… afina la búsqueda.</div>" : "");
    _0x19329c.querySelectorAll("[data-globalsearch-qty]").forEach(_0x2492ec => {
      _0x2492ec.addEventListener("click", () => _0x4fac24(_0x2492ec.dataset.globalsearchQty));
    });
    _0x19329c.querySelectorAll("[data-globalsearch-edit]").forEach(_0x1cc932 => {
      _0x1cc932.addEventListener("click", () => _0x243f07(_0x1cc932.dataset.globalsearchEdit));
    });
  }
  function _0x4fc746() {
    const _0x30b86a = [];
    estado.vehiculos.forEach(_0x1fd5c8 => {
      _0x4f0ebd(_0x1fd5c8.id).forEach(_0x576117 => {
        const _0x509b36 = _0x22e6c7(_0x576117, _0x1fd5c8.kmActual || 0);
        if (_0x509b36.estado !== "ok") {
          _0x30b86a.push({
            vehiculo: _0x1fd5c8.matricula,
            tarea: _0x576117.nombre,
            estado: _0x509b36.estado
          });
        }
      });
    });
    return _0x30b86a;
  }
  function _0x2af187() {
    const _0x86798b = $("#alertBanner");
    if (!_0x86798b) {
      return;
    }
    // El aviso de stock y mantenimiento es trabajo de Almacén: no ocupa la pantalla en Trabajo, Pedido ni Trabajadores
    const _0xesTallerAviso = _0x2df77d() === "taller" || !["almacen", "resumen", "mantenimiento"].includes(estado.mode);
    const _0x10f382 = _0xesTallerAviso ? [] : _0x3fdd17();
    const _0x5836a0 = _0xesTallerAviso ? [] : _0x41ba69();
    const _0x2e6ddc = _0xesTallerAviso ? [] : _0x4fc746();
    if (!_0x10f382.length && !_0x5836a0.length && !_0x2e6ddc.length) {
      _0x86798b.style.display = "none";
      _0x86798b.innerHTML = "";
      return;
    }
    const _0x47b814 = [];
    if (_0x5836a0.length) {
      _0x47b814.push(_0x5836a0.length + " material(es) con " + estado.settings.stockBajoUmbral + " unidades o menos");
    }
    if (_0x10f382.length) {
      _0x47b814.push(_0x10f382.length + " bobina(s) a punto de expirar");
    }
    if (_0x2e6ddc.length) {
      const _0x2e9291 = _0x2e6ddc.filter(_0xc0d814 => _0xc0d814.estado === "atrasada").length;
      _0x47b814.push(_0x2e6ddc.length + " revisión(es) de vehículo pendiente(s)" + (_0x2e9291 ? " (" + _0x2e9291 + " atrasada(s))" : ""));
    }
    _0x86798b.style.display = "block";
    const _0x3897b9 = [];
    if (_0x5836a0.length || _0x10f382.length) {
      _0x3897b9.push("Almacén");
    }
    if (_0x2e6ddc.length) {
      _0x3897b9.push("Mantenimiento");
    }
    _0x86798b.innerHTML = "Aviso: " + _0x47b814.join(" · ") + ". Revísalo en " + _0x3897b9.join(" o ") + ".";
  }
  function _0x9e6851() {
    const _0x3fac10 = $("#pedidoNotifBanner");
    if (!_0x3fac10) {
      return;
    }
    // Cada rol ve sus avisos: almacén los pedidos nuevos, taller el material listo (los antiguos, sin «para», son de almacén)
    const __rol = _0x2df77d();
    const _0x2fe6bc = estado.notifications.filter(_0x263003 => !_0x263003.leida && (_0x263003.para || "almacen") === __rol).slice(0, 5);
    _0x2fe6bc.forEach(_0x2ffdc6 => {
      if (!_0x1f4699.has(_0x2ffdc6.id)) {
        _0x1f4699.add(_0x2ffdc6.id);
        _0x8133c4();
        _0x4c4050(_0x2ffdc6);
      }
    });
    if (!_0x2fe6bc.length) {
      _0x3fac10.innerHTML = "";
      return;
    }
    _0x3fac10.innerHTML = _0x2fe6bc.map(_0x3cb792 => "\n      <div class=\"alert-banner\" style=\"cursor:pointer; display:flex; justify-content:space-between; align-items:center; gap:8px;\" data-notif-id=\"" + _0x3cb792.id + "\">\n        <span>" + (_0x3cb792.para === "taller" ? "Material listo para recoger en " : "Nuevo pedido en ") + "<strong>" + _0x1d1ab0(_0x3cb792.groupName) + "</strong> (" + (_0x3cb792.groupKind === "montaje" ? "Montaje/Venta" : "Proyecto") + (_0x3cb792.tipo ? " · " + _0x1d1ab0(_0x3cb792.tipo) : "") + ")" + (_0x3cb792.para === "taller" ? "" : " — pedido por " + _0x1d1ab0(_0x3cb792.requesterName)) + ", " + _0x3cb792.lineas + " línea(s). Pulsa para ir ahí.</span>\n        <button class=\"btn-return\" data-notif-close=\"" + _0x3cb792.id + "\" style=\"flex:none;\">×</button>\n      </div>\n    ").join("");
    _0x3fac10.querySelectorAll("[data-notif-id]").forEach(_0x599a06 => {
      _0x599a06.addEventListener("click", _0x451b2d => {
        if (_0x451b2d.target.closest("[data-notif-close]")) {
          return;
        }
        _0x3b142c(_0x599a06.dataset.notifId);
      });
    });
    _0x3fac10.querySelectorAll("[data-notif-close]").forEach(_0x2585d5 => {
      _0x2585d5.addEventListener("click", _0x3b8d83 => {
        _0x3b8d83.stopPropagation();
        _0x3b2431(_0x2585d5.dataset.notifClose);
      });
    });
  }
  function _0x3b2431(_0x509d41) {
    const _0x566143 = estado.notifications.find(_0x2462a3 => _0x2462a3.id === _0x509d41);
    if (_0x566143) {
      _0x566143.leida = true;
      guardarAvisos();
    }
    render();
  }
  async function _0x3b142c(_0x57b315) {
    const _0x2daf16 = estado.notifications.find(_0x12cb14 => _0x12cb14.id === _0x57b315);
    if (!_0x2daf16) {
      return;
    }
    _0x2daf16.leida = true;
    guardarAvisos();
    estado.mode = _0x2daf16.groupKind;
    await _0x2f0e01(_0x2daf16.groupKind, _0x2daf16.groupName);
    _0x5592da = "hoja";
    render();
  }
  let _0x1e9600 = "montaje";
  function _0x4197e5() {
    const _0x212998 = $("#modeBar");
    const _0x5967fd = _0x2df77d() === "taller";
    const _0x51f32c = estado.mode === "montaje" || estado.mode === "proyecto";
    const __icoR = "<svg viewBox=\"0 0 20 20\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.6\"><rect x=\"2.5\" y=\"2.5\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"11.5\" y=\"2.5\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"2.5\" y=\"11.5\" width=\"6\" height=\"6\" rx=\"1\"/><rect x=\"11.5\" y=\"11.5\" width=\"6\" height=\"6\" rx=\"1\"/></svg>";
    const __icoT = "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14.7 6.3a4 4 0 1 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.8 2.8-2-2 2.8-2.8z\"/></svg>";
    const __icoA = "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 8l9-5 9 5-9 5-9-5z\"/><path d=\"M3 8v8l9 5 9-5V8\"/><path d=\"M12 13v8\"/></svg>";
    const __icoP = "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"5\" y=\"3.5\" width=\"14\" height=\"17\" rx=\"2\"/><path d=\"M9 3.5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5\"/><path d=\"M8.5 10h7M8.5 13.5h7M8.5 17h4.5\"/></svg>";
    const __icoM = "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M3 16V7a1 1 0 0 1 1-1h9v10\"/><path d=\"M13 10h4l3 3v3h-2\"/><circle cx=\"7\" cy=\"17\" r=\"1.8\"/><circle cx=\"17\" cy=\"17\" r=\"1.8\"/></svg>";
    const __icoW = "<svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"9\" cy=\"7\" r=\"3\"/><path d=\"M2 20v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 5.6 3.9\"/><circle cx=\"17\" cy=\"9\" r=\"2.5\"/><path d=\"M15 20v-1a5 5 0 0 1 4-4.9\"/></svg>";
    const _0x456962 = [["resumen", "Resumen", "", __icoR], ["trabajo", "Trabajo", "", __icoT], ["almacen", "Almacén", " (Stock)", __icoA], ["pedido", "Reponer", "", __icoP], ["mantenimiento", "Mantenimiento", "", __icoM], ["trabajadores", "Trabajadores", "", __icoW]].filter(([_0x5079c0]) => !_0x5967fd || _0x5079c0 !== "almacen" && _0x5079c0 !== "resumen" && _0x5079c0 !== "mantenimiento" && _0x5079c0 !== "trabajadores");
    try {
      const __appElSb = document.getElementById("app");
      if (__appElSb) {
        __appElSb.classList.toggle("sidebar-collapsed", localStorage.getItem("tecnomat_sidebar_collapsed") === "1");
      }
    } catch {}
    const __esActiva = __id => __id === "trabajo" ? _0x51f32c : estado.mode === __id;
    const __botonSeccion = ([_0x1f2080, _0x5bd5c4, _0x5b3cec, _0x1c0nSvg]) => "<button type=\"button\" class=\"mode-btn " + (__esActiva(_0x1f2080) ? "active\" aria-current=\"page" : "") + "\" data-mode=\"" + _0x1f2080 + "\"><span class=\"mode-btn-icon\">" + _0x1c0nSvg + "</span><span class=\"mode-btn-label\">" + _0x5bd5c4 + "</span><span class=\"label-extra\">" + _0x5b3cec + "</span></button>";
    // En el móvil caben 4 secciones legibles; Mantenimiento y Trabajadores van en «Más» (en ordenador el carril las muestra todas)
    const __extra = _0x456962.filter(([__id]) => __id === "mantenimiento" || __id === "trabajadores");
    const __botonesSeccion = _0x456962.filter(__s => !__extra.includes(__s)).map(__botonSeccion).join("") + (__extra.length ? "<button type=\"button\" class=\"mode-btn mas-btn" + (__extra.some(([__id]) => __esActiva(__id)) ? " active" : "") + "\" aria-expanded=\"false\" aria-controls=\"modePanelMas\"><span class=\"mode-btn-icon\"><svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\" fill=\"currentColor\" aria-hidden=\"true\"><circle cx=\"5\" cy=\"12\" r=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/><circle cx=\"19\" cy=\"12\" r=\"2\"/></svg></span><span class=\"mode-btn-label\">Más</span></button><div class=\"mas-panel\" id=\"modePanelMas\">" + __extra.map(__botonSeccion).join("") + "</div>" : "");
    _0x212998.innerHTML = "<button class=\"mode-bar-toggle\" id=\"modeBarToggleBtn\" title=\"Contraer o expandir el menú\" aria-label=\"Contraer o expandir el menú\"><svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 4l-6 8 6 8M19 4l-6 8 6 8\"/></svg></button>" + __botonesSeccion;
    // Cartel de pasillo: el título de la app dice en qué sección estás, con su icono
    const __cartel = document.querySelector("#app > h1");
    const __seccion = _0x456962.find(([__id]) => __id === (_0x51f32c ? "trabajo" : estado.mode));
    if (__cartel && __seccion) {
      __cartel.innerHTML = "<span class=\"pasillo-ico\" aria-hidden=\"true\">" + __seccion[3] + "</span><span class=\"pasillo-txt\">" + (_0x51f32c ? (estado.mode === "proyecto" ? "Proyecto" : "Montaje / Venta") : __seccion[1]) + "</span>";
    }
    const __mas = _0x212998.querySelector(".mas-btn");
    if (__mas) {
      __mas.addEventListener("click", () => {
        const __abierto = _0x212998.classList.toggle("mas-abierto");
        __mas.setAttribute("aria-expanded", String(__abierto));
      });
    }
    _0x212998.querySelectorAll(".mode-btn[data-mode]").forEach(_0x20a919 => {
      _0x20a919.addEventListener("click", () => {
        estado.mode = _0x20a919.dataset.mode === "trabajo" ? _0x1e9600 : _0x20a919.dataset.mode;
        _0x24edec = null;
        _0x1dfbd0 = null;
        _0x5592da = "chat";
        clearTimeout(_0x279f78._t);
        const _0x42e1bb = $("#statusBanner");
        if (_0x42e1bb) {
          _0x42e1bb.style.display = "none";
        }
        _0x430fb2();
        render();
      });
    });
    (function () {
      const __act = _0x212998.querySelector(".mode-btn.active");
      if (__act) {
        __act.scrollIntoView({
          block: "nearest",
          inline: "center"
        });
      }
    })();
    const __btnSbToggle = document.getElementById("modeBarToggleBtn");
    if (__btnSbToggle) {
      __btnSbToggle.addEventListener("click", () => {
        const __appElSb2 = document.getElementById("app");
        if (!__appElSb2) {
          return;
        }
        const __nowCollapsed = !__appElSb2.classList.contains("sidebar-collapsed");
        __appElSb2.classList.toggle("sidebar-collapsed", __nowCollapsed);
        try {
          localStorage.setItem("tecnomat_sidebar_collapsed", __nowCollapsed ? "1" : "0");
        } catch {}
      });
    }
  }
  let _0x29db0a = false;
  let _0x39b15b = false;
  let _0x363017 = false;
  let _0x411628 = false;
  let _0x15a759 = false;
  let _0xcbd78e = false;
  function _0x33d6d2() {
    const _0x55218f = estado.mode;
    const _0xbdd625 = estado.current[_0x55218f];
    const _0x2ef914 = _0xbdd625 ? buscarGrupo(_0x55218f, _0xbdd625) : null;
    const _0x42ac79 = estado.groups.montaje.map(_0x347cab => ({
      ..._0x347cab,
      kind: "montaje"
    })).concat(estado.groups.proyecto.map(_0x4fffd3 => ({
      ..._0x4fffd3,
      kind: "proyecto"
    }))).sort((_0x177222, _0x2f763f) => _0x177222.name.localeCompare(_0x2f763f.name));
    return "\n      " + (_0x42ac79.length > 6 ? "\n      <input type=\"text\" id=\"groupFilterInput\" placeholder=\"Buscar orden o proyecto…\" style=\"width:100%; margin-bottom:6px;\">\n      " : "") + "\n      <div class=\"project-bar\">\n        <select id=\"groupSelect\" style=\"flex:1;\">\n          <option value=\"\">— Selecciona una orden o proyecto —</option>\n          " + _0x42ac79.map(_0x1b186f => "<option value=\"" + _0x1b186f.kind + "::" + _0x1d1ab0(_0x1b186f.name) + "\" " + (_0x1b186f.kind === _0x55218f && _0x1b186f.name === _0xbdd625 ? "selected" : "") + ">" + (_0x1b186f.kind === "montaje" ? "Montaje" : "Proyecto") + ": " + _0x1d1ab0(_0x1b186f.name) + (_0x1b186f.tipo ? " [" + _0x1d1ab0(_0x1b186f.tipo) + "]" : "") + (_0x1b186f.status === "finalizado" ? " (Finalizado)" : "") + "</option>").join("") + "\n        </select>\n        <button class=\"cam-btn\" id=\"toggleNuevoTrabajoBtn\" style=\"flex:none; padding:9px 14px; min-height:auto;\">" + (_0x29db0a ? "Cancelar" : "+ Nueva") + "</button>\n      </div>\n      " + (_0x2ef914 ? "\n      <div style=\"display:flex; align-items:center; justify-content:space-between; gap:6px; flex-wrap:wrap; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.03em; color:var(--text-faint); margin:-2px 0 8px 2px;\">\n        <span>\n          <span style=\"color:" + (_0x2ef914.status === "finalizado" ? "var(--text-muted)" : "var(--success)") + ";\">" + (_0x2ef914.status === "finalizado" ? "Finalizado" : "Activo") + "</span>\n          · " + (_0x55218f === "montaje" ? "Montaje" : "Proyecto") + "\n          " + (_0x2ef914.tipo ? " · " + _0x1d1ab0(_0x2ef914.tipo) : "") + "\n        </span>" + (_0x2df77d() !== "taller" ? "\n        <button class=\"cam-btn\" id=\"toggleMasOpcionesBtn\" style=\"flex:none; padding:6px 12px; font-size:13px; min-height:44px;\">" + (_0x411628 ? "Ocultar" : "Opciones de la orden") + "</button>" : "") + "\n      </div>\n      " + (_0x411628 && _0x2df77d() !== "taller" ? "\n      <div class=\"project-bar project-bar-inline\" style=\"margin-top:0;\">\n        <button class=\"cam-btn\" id=\"toggleStatusBtn\" style=\"flex:1;\">" + (_0x2ef914.status === "finalizado" ? "Reactivar" : "Finalizar") + "</button>\n        " + (_0x2df77d() === "taller" ? "" : "<button class=\"btn-return\" id=\"deleteGroupBtn\" style=\"flex:1;\">" + _0x56ae2b("eliminar") + "Eliminar</button>") + "\n      </div>\n      " : "") + "\n      " : "") + "\n      " + (_0x29db0a ? "\n      <div class=\"project-bar\" style=\"margin-top:8px;\">\n        <input type=\"text\" id=\"newGroupInput\" placeholder=\"Nombre de la orden o proyecto…\" value=\"" + _0x1d1ab0(_0x4a2438.nombre) + "\">\n        <select id=\"newGroupKind\">\n          <option value=\"montaje\" " + (_0x4a2438.kind !== "proyecto" ? "selected" : "") + ">Montaje/Venta</option>\n          <option value=\"proyecto\" " + (_0x4a2438.kind === "proyecto" ? "selected" : "") + ">Proyecto</option>\n        </select>\n        <button class=\"cam-btn\" id=\"createGroupBtn\">+ Crear</button>\n      </div>\n      " : "") + "\n    ";
  }
  function _0x241b98(_0x4beafe) {
    const _0x429822 = estado.mode;
    const _0x242c16 = estado.current[_0x429822];
    const _0x5d9f7d = _0x4beafe.querySelector("#groupFilterInput");
    if (_0x5d9f7d) {
      _0x5d9f7d.addEventListener("input", () => {
        const _0x56469d = _0x5d9f7d.value.trim().toLowerCase();
        _0x4beafe.querySelectorAll("#groupSelect option").forEach(_0x6d3947 => {
          if (!_0x6d3947.value) {
            _0x6d3947.style.display = "";
            return;
          }
          _0x6d3947.style.display = _0x6d3947.textContent.toLowerCase().includes(_0x56469d) ? "" : "none";
        });
      });
    }
    _0x4beafe.querySelector("#groupSelect").addEventListener("change", _0x1497cf => {
      const [_0x21c88f, _0x9a19d0] = _0x1497cf.target.value.split("::");
      if (!_0x21c88f) {
        return;
      }
      _0x1e9600 = _0x21c88f;
      estado.mode = _0x21c88f;
      _0x2f0e01(_0x21c88f, _0x9a19d0);
    });
    _0x4beafe.querySelector("#toggleNuevoTrabajoBtn").addEventListener("click", () => {
      _0x29db0a = !_0x29db0a;
      render();
    });
    const _0x5664dd = _0x4beafe.querySelector("#toggleMasOpcionesBtn");
    if (_0x5664dd) {
      _0x5664dd.addEventListener("click", () => {
        _0x411628 = !_0x411628;
        render();
      });
    }
    const _0x245889 = _0x4beafe.querySelector("#newGroupInput");
    if (_0x245889) {
      _0x245889.addEventListener("input", _0x2a8820 => {
        _0x4a2438.nombre = _0x2a8820.target.value;
      });
      _0x4beafe.querySelector("#newGroupKind").addEventListener("change", _0x507184 => {
        _0x4a2438.kind = _0x507184.target.value;
      });
      let _crearOrdenEnCurso = false;
      const _0x510e01 = async () => {
        if (_crearOrdenEnCurso) {
          return;
        }
        _crearOrdenEnCurso = true;
        try {
          const _0x19c3d9 = _0x4beafe.querySelector("#newGroupInput").value;
          const _0x34aac0 = _0x4beafe.querySelector("#newGroupKind").value;
          const _0x1d8ffc = "";
          if (!_0x19c3d9.trim()) {
            _0x279f78("Escribe el nombre de la orden o proyecto.");
            return;
          }
          const _0xd4dca3 = await _0x3b375f("¿Quién pide el material para \"" + _0x19c3d9.trim() + "\"? (obligatorio)");
          if (!_0xd4dca3 || !_0xd4dca3.trim()) {
            _0x279f78("Hace falta indicar quién pide el material para crear la orden/proyecto.");
            return;
          }
          _0x4a2438 = {
            nombre: "",
            requester: "",
            tipo: "",
            kind: _0x34aac0
          };
          _0x29db0a = false;
          _0x1e9600 = _0x34aac0;
          estado.mode = _0x34aac0;
          _0xc78429(_0x34aac0, _0x19c3d9, _0xd4dca3.trim(), _0x1d8ffc);
        } finally {
          _crearOrdenEnCurso = false;
        }
      };
      _0x4beafe.querySelector("#createGroupBtn").addEventListener("click", _0x510e01);
      _0x245889.addEventListener("keydown", _0x5e0043 => {
        if (_0x5e0043.key === "Enter") {
          _0x5e0043.preventDefault();
          _0x510e01();
        }
      });
    }
    const _0x556da5 = _0x4beafe.querySelector("#toggleStatusBtn");
    if (_0x556da5) {
      _0x556da5.addEventListener("click", () => _0x55946d(_0x429822, _0x242c16));
    }
    const _0x5188c2 = _0x4beafe.querySelector("#deleteGroupBtn");
    if (_0x5188c2) {
      _0x5188c2.addEventListener("click", () => _0x2d4970(_0x429822, _0x242c16));
    }
  }
  function _0x323e0f() {
    const _0x559be = $("#scannerZone");
    if (estado.mode === "mantenimiento" || estado.mode === "resumen" || estado.mode === "trabajadores" || _0x2df77d() !== "almacen") {
      _0x559be.innerHTML = "";
      return;
    }
    const _0x2cfb13 = estado.mode === "montaje" || estado.mode === "proyecto" ? estado.mode : null;
    const _0x391aec = _0x2cfb13 ? estado.current[_0x2cfb13] : null;
    const _0x3b4334 = _0x391aec ? buscarGrupo(_0x2cfb13, _0x391aec) : null;
    const _0x1ea4cb = !!_0x3b4334 && _0x3b4334.status === "finalizado";
    const _0x514647 = _0x2cfb13 ? _0x1ea037() : null;
    const _0x4664d6 = _0x2cfb13 && !_0x391aec || _0x1ea4cb;
    const _0xa728ab = _0x2cfb13 && !_0x391aec ? "Selecciona " + (_0x2cfb13 === "montaje" ? "una orden de montaje/venta" : "un proyecto") + " para escanear…" : _0x1ea4cb ? (_0x2cfb13 === "montaje" ? "Orden finalizada" : "Proyecto finalizado") + " — reactívala para seguir registrando…" : estado.mode === "almacen" ? "Escanea para registrar una entrada de stock…" : estado.mode === "pedido" ? "Escanea o introduce el código para añadirlo al pedido…" : "Escanea o introduce el código para añadirlo a la solicitud…";
    const _0x84fca4 = estado.mode === "almacen" ? _0x345037 === "entrada" ? "Suma al stock. Material nuevo: pide referencia." : "Resta del stock — no deja bajar de 0." : estado.mode === "pedido" ? "Añade al pedido — no descuenta stock." : "Va a la solicitud pendiente — no descuenta stock aún.";
    const _0x4ad6be = estado.mode === "almacen" ? _0x345037 === "entrada" ? "Registrar entrada" : "Registrar salida" : estado.mode === "pedido" ? "+ Añadir" : "+ Solicitar";
    const _0x8c9156 = estado.mode === "almacen" ? _0x345037 === "entrada" ? "var(--success)" : "var(--danger)" : "";
    _0x559be.innerHTML = "\n      <div class=\"scanner-panel\" style=\"" + (estado.mode === "almacen" ? "border-top:4px solid " + _0x8c9156 + "; background:linear-gradient(90deg, " + (_0x345037 === "entrada" ? "var(--success-soft)" : "var(--danger-soft)") + ", transparent 220px);" : "") + "\">\n        " + (estado.mode === "almacen" ? "\n          <div style=\"font-family:var(--letra-cartel); font-weight:800; font-size:20px; text-transform:uppercase; letter-spacing:.03em; color:" + _0x8c9156 + "; margin-bottom:8px;\">\n            Modo activo: " + (_0x345037 === "entrada" ? "ENTRADA (suma al stock)" : "SALIDA (resta del stock)") + "\n          </div>\n          <div class=\"scanner-row\" style=\"margin-bottom:8px;\">\n            <button class=\"mode-btn\" data-almacen-scan-modo=\"entrada\" style=\"flex:1; padding:12px; font-size:15px; " + (_0x345037 === "entrada" ? "background:var(--success); color:#0A2016;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">+ ENTRADA</button>\n            <button class=\"mode-btn\" data-almacen-scan-modo=\"salida\" style=\"flex:1; padding:12px; font-size:15px; " + (_0x345037 === "salida" ? "background:var(--danger); color:#2A0C10;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">− SALIDA</button>\n          </div>\n        " : "") + "\n        <div class=\"scanner-row\">\n          <input id=\"scanInput\" type=\"text\" placeholder=\"" + _0xa728ab + "\" " + (_0x4664d6 ? "disabled" : "") + " autocomplete=\"off\" style=\"" + (estado.mode === "almacen" ? "border-color:" + _0x8c9156 + ";" : "") + "\">\n        </div>\n        <div class=\"scanner-actions\">\n          <button class=\"cam-btn\" id=\"camBtn\" " + (_0x4664d6 ? "disabled" : "") + ">Cámara</button>\n          <button class=\"btn primary\" id=\"scanSubmitBtn\" " + (_0x4664d6 ? "disabled" : "") + ">" + _0x4ad6be + "</button>\n        </div>\n        <label style=\"display:flex; align-items:center; gap:6px; margin-top:8px; font-size:12px; color:var(--text-muted); cursor:pointer;\">\n          <input type=\"checkbox\" id=\"modoRapidoX1Chk\" " + (_0x2ff082 ? "checked" : "") + " style=\"width:16px; height:16px;\"> Modo rápido: cada escaneo cuenta como 1 unidad, sin preguntar\n        </label>\n        <div class=\"scan-hint\">" + _0x84fca4 + "</div>\n        " + (_0x24edec ? "\n          <div class=\"unknown-box\">\n            <span>Nueva referencia para el código <strong>" + _0x1d1ab0(_0x24edec.code) + "</strong>:</span>\n            <input id=\"unknownDesc\" type=\"text\" placeholder=\"Artículo…\">\n            <input id=\"unknownRef\" type=\"text\" placeholder=\"Referencia (opcional)…\">\n            <input id=\"unknownLoc\" type=\"text\" placeholder=\"Ubicación (opcional)…\" list=\"ubicacionesList\">\n            <select id=\"unknownCategoria\" style=\"background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:8px 10px; border-radius:6px;\">\n              <option value=\"\">Categoría…</option>\n              " + _0x23f5f6.map(_0x553a77 => "<option value=\"" + _0x1d1ab0(_0x553a77) + "\">" + _0x1d1ab0(_0x553a77) + "</option>").join("") + "\n            </select>\n            <button class=\"cam-btn\" id=\"confirmUnknownBtn\">Añadir y registrar</button>\n          </div>\n        " : "") + "\n        " + (_0x1dfbd0 ? "\n          <div class=\"unknown-box\" style=\"flex-direction:column; align-items:stretch;\">\n            <span>El código <strong>" + _0x1d1ab0(_0x1dfbd0.code) + "</strong> tiene varias referencias registradas. ¿Cuál es?</span>\n            <div class=\"code-choice-list\">\n              " + _0x1dfbd0.matches.map(_0xa7ff30 => {
      const _0x36d4fe = estado.catalog.find(_0x3973d7 => _0x3973d7.id === _0xa7ff30);
      if (!_0x36d4fe) {
        return "";
      }
      return "<button class=\"cam-btn code-choice-btn\" data-choice-item=\"" + _0x36d4fe.id + "\">" + _0x1d1ab0(_0x36d4fe.desc) + " <span class=\"code-choice-meta\">· " + _0x36d4fe.qty + " uds · Ubic: " + (_0x1d1ab0(_0x36d4fe.location) || "sin ubicar") + "</span></button>";
    }).join("") + "\n              <button class=\"cam-btn code-choice-btn\" id=\"choiceCreateNewBtn\" style=\"border-style:dashed;\">+ Crear otra referencia nueva con este código</button>\n            </div>\n          </div>\n        " : "") + "\n      </div>\n    ";
    _0x559be.querySelectorAll("[data-almacen-scan-modo]").forEach(_0x532f68 => {
      _0x532f68.addEventListener("click", () => {
        _0x345037 = _0x532f68.dataset.almacenScanModo;
        _0x323e0f();
      });
    });
    const _0x2d8ec0 = $("#modoRapidoX1Chk");
    if (_0x2d8ec0) {
      _0x2d8ec0.addEventListener("change", _0x59ba7e => {
        _0x2ff082 = _0x59ba7e.target.checked;
      });
    }
    const _0x156ae7 = $("#scanInput");
    if (_0x156ae7) {
      _0x156ae7.addEventListener("keydown", _0x47ebb2 => {
        if (_0x47ebb2.key === "Enter") {
          _0x47ebb2.preventDefault();
          const _0x3546a8 = _0x156ae7.value;
          _0x156ae7.value = "";
          _0x1803b3(_0x3546a8);
        }
      });
      if (!_0x4664d6) {
        _0x156ae7.setAttribute("readonly", "readonly");
        _0x156ae7.focus({
          preventScroll: true
        });
        setTimeout(() => {
          _0x156ae7.removeAttribute("readonly");
        }, 50);
      }
      _0x156ae7.addEventListener("touchstart", () => {
        _0x156ae7.blur();
        _0x156ae7.focus();
      }, {
        passive: true
      });
      _0x156ae7.addEventListener("mousedown", () => {
        _0x156ae7.blur();
        _0x156ae7.focus();
      });
    }
    const _0x3efee8 = $("#scanSubmitBtn");
    if (_0x3efee8) {
      _0x3efee8.addEventListener("click", () => {
        const _0xea2c1b = _0x156ae7.value;
        _0x156ae7.value = "";
        _0x1803b3(_0xea2c1b);
      });
    }
    const _0x4b1e6b = $("#camBtn");
    if (_0x4b1e6b) {
      _0x4b1e6b.addEventListener("click", () => _0xe99bca(_0x1803b3));
    }
    const _0x631bff = $("#confirmUnknownBtn");
    if (_0x631bff) {
      _0x631bff.addEventListener("click", _0x4192c8);
      $("#unknownDesc").addEventListener("keydown", _0x548517 => {
        if (_0x548517.key === "Enter") {
          _0x548517.preventDefault();
          _0x4192c8();
        }
      });
      $("#unknownRef").addEventListener("keydown", _0x170dae => {
        if (_0x170dae.key === "Enter") {
          _0x170dae.preventDefault();
          _0x4192c8();
        }
      });
      $("#unknownLoc").addEventListener("keydown", _0x677d0e => {
        if (_0x677d0e.key === "Enter") {
          _0x677d0e.preventDefault();
          _0x4192c8();
        }
      });
      $("#unknownDesc").focus({
        preventScroll: true
      });
    }
    if (_0x1dfbd0) {
      _0x559be.querySelectorAll("[data-choice-item]").forEach(_0x336eae => {
        _0x336eae.addEventListener("click", () => {
          const _0x4b8924 = estado.catalog.find(_0x28bee3 => _0x28bee3.id === _0x336eae.dataset.choiceItem);
          _0x1dfbd0 = null;
          if (_0x4b8924) {
            _0x2d3f0d(_0x4b8924);
          }
          _0x323e0f();
        });
      });
      const _0xa94b22 = $("#choiceCreateNewBtn");
      if (_0xa94b22) {
        _0xa94b22.addEventListener("click", () => {
          const _0x57f8ab = _0x1dfbd0.code;
          _0x1dfbd0 = null;
          _0x24edec = {
            code: _0x57f8ab
          };
          _0x323e0f();
        });
      }
    }
  }
  function _0x198ddf() {
    if (estado.mode === "montaje") {
      if (estado.current.montaje) {
        return "Montaje/Venta: " + _0x1d1ab0(estado.current.montaje);
      } else {
        return "Orden de montaje/venta";
      }
    }
    if (estado.current.proyecto) {
      return "Proyecto: " + _0x1d1ab0(estado.current.proyecto);
    } else {
      return "Proyecto";
    }
  }
  let _0x345037 = "entrada";
  let _0x2ff082 = false;
  let _0x177050 = null;
  let _0x1b0226 = "";
  let _0x30947e = false;
  let _0x101019 = false;
  function _0x1c3cca() {
    if (estado.mode !== "almacen") {
      return;
    }
    const _0x231638 = $("#mainList");
    const _0x2580ea = _0x1a8b0d.trim().toLowerCase();
    const _0x1318d4 = estado.catalog.filter(_0x2dce44 => !_0x2580ea || _0x2dce44.code.toLowerCase().includes(_0x2580ea) || _0x2dce44.desc.toLowerCase().includes(_0x2580ea) || _0x2dce44.referencia && _0x2dce44.referencia.toLowerCase().includes(_0x2580ea)).filter(_0x110031 => !_0x1b0226 || _0x110031.categoria === _0x1b0226).filter(_0x4e3e62 => !_0x30947e || _0x4e3e62.qty <= 0).filter(_0x6ac846 => !_0x101019 || !_0x6ac846.location).slice().sort((_0x562039, _0x5b6cd2) => _0x562039.code.localeCompare(_0x5b6cd2.code));
    const _0x39c62a = _0x1318d4.slice(0, _0x2ba7a9);
    const _0x4641a7 = _0x39c62a.map(_0x4a3c61 => "\n      <div class=\"stock-row\">\n        <input type=\"checkbox\" class=\"stock-select\" aria-label=\"Seleccionar referencia\" data-select-id=\"" + _0x4a3c61.id + "\" " + (_0xf103fd.has(_0x4a3c61.id) ? "checked" : "") + " style=\"flex:none; width:16px; height:16px; margin-right:4px;\">\n        <div class=\"row-main\">\n          <div class=\"row-code\">" + _0x1d1ab0(_0x4a3c61.code) + (_0x4a3c61.marca ? " · <span style=\"color:var(--text-faint); font-weight:400;\">" + _0x1d1ab0(_0x4a3c61.marca) + "</span>" : "") + "</div>\n          <div class=\"row-desc\">" + (_0x1d1ab0(_0x4a3c61.desc) || "<span style=\"color:var(--text-faint); font-style:italic;\">Sin artículo — pulsa \"Editar\" o edítalo desde el Excel</span>") + "</div>\n          " + (_0x4a3c61.referencia ? "<div style=\"font-size:11px; color:var(--text-faint); margin-top:1px;\">Ref: " + _0x1d1ab0(_0x4a3c61.referencia) + "</div>" : "") + "\n        </div>\n        <div class=\"row-actions\">\n          <span class=\"stock-loc " + (_0x4a3c61.location ? "set" : "unset") + "\">" + (_0x1d1ab0(_0x4a3c61.location) || "Sin ubicar") + "</span>\n          " + (_0x4a3c61.categoria ? "<span class=\"stock-loc set\">Cat: " + _0x1d1ab0(_0x4a3c61.categoria) + "</span>" : "") + "\n          <span class=\"stock-qty " + (_0x4a3c61.qty > 0 ? "ok" : "low") + "\">" + _0x4a3c61.qty + "</span>\n          <button class=\"cam-btn\" style=\"padding:9px 14px; font-size:13px; min-height:44px;\" data-edit-btn=\"" + _0x4a3c61.id + "\">" + _0x56ae2b("editar") + "Editar</button>\n          <button class=\"cam-btn\" style=\"padding:9px 14px; font-size:13px; min-height:44px;\" data-qty-btn=\"" + _0x4a3c61.id + "\">Cambiar cantidad</button>\n        </div>\n      </div>\n    ").join("") + (_0x1318d4.length > _0x39c62a.length ? "\n      <button class=\"cam-btn\" id=\"stockLoadMoreBtn\" style=\"width:100%; margin-top:4px;\">Cargar más (quedan " + (_0x1318d4.length - _0x39c62a.length) + ")</button>\n    " : "");
    _0x231638.innerHTML = "\n      " + (_0xf103fd.size ? "\n      <div class=\"panel\" style=\"margin-bottom:14px;\">\n        <p class=\"panel-title\">" + _0xf103fd.size + " referencia(s) seleccionada(s)</p>\n        <div class=\"backup-row\">\n          <button class=\"cam-btn\" id=\"bulkLocBtn\">Cambiar ubicación a todas</button>\n          <button class=\"cam-btn\" id=\"bulkQtyBtn\">Cambiar cantidad a todas</button>\n          <button class=\"btn-return\" id=\"bulkDelBtn\">Eliminar seleccionadas</button>\n        </div>\n      </div>" : "") + "\n\n      <div class=\"panel\" style=\"margin-bottom:14px;\">\n        <p class=\"panel-title\">Filtros</p>\n        <div class=\"manual-stock-form\" style=\"margin-top:0;\">\n          <select id=\"stockFiltroCategoriaSel\">\n            <option value=\"\">Todas las categorías</option>\n            " + _0x23f5f6.map(_0x5599e4 => "<option value=\"" + _0x1d1ab0(_0x5599e4) + "\" " + (_0x1b0226 === _0x5599e4 ? "selected" : "") + ">" + _0x1d1ab0(_0x5599e4) + "</option>").join("") + "\n          </select>\n          <label style=\"display:flex; align-items:center; gap:6px; flex:1; min-width:150px; font-size:13px; color:var(--text-primary);\">\n            <input type=\"checkbox\" id=\"stockFiltroBajoChk\" " + (_0x30947e ? "checked" : "") + " style=\"width:16px; height:16px;\"> Solo stock bajo (0)\n          </label>\n          <label style=\"display:flex; align-items:center; gap:6px; flex:1; min-width:150px; font-size:13px; color:var(--text-primary);\">\n            <input type=\"checkbox\" id=\"stockFiltroSinUbicarChk\" " + (_0x101019 ? "checked" : "") + " style=\"width:16px; height:16px;\"> Solo sin ubicar\n          </label>\n          " + (_0x1b0226 || _0x30947e || _0x101019 ? "<button class=\"cam-btn\" id=\"stockFiltroLimpiarBtn\" style=\"flex:none;\">Quitar filtros</button>" : "") + "\n        </div>\n      </div>\n\n      <div class=\"ticket\">\n        <div class=\"ticket-header\">\n          <span class=\"ticket-title\"><label style=\"cursor:pointer; display:flex; align-items:center; gap:5px;\"><input type=\"checkbox\" id=\"selectAllStock\" style=\"width:15px; height:15px;\"> Stock actual</label></span>\n          <span class=\"ticket-title\">" + _0x1318d4.length + " referencias</span>\n        </div>\n        <div class=\"ticket-body\">\n          " + (_0x4641a7 || "<div class=\"empty-state\">" + (_0x2580ea || _0x1b0226 || _0x30947e || _0x101019 ? "Sin coincidencias con estos filtros." : "Todavía no hay materiales en el stock. Añade uno abajo o importa tu Excel.") + "</div>") + "\n        </div>\n      </div>\n\n      <div class=\"panel\" style=\"margin-top:14px;\">\n        <p class=\"panel-title\">Añadir stock manualmente</p>\n        <div class=\"manual-stock-form\">\n          <input type=\"text\" name=\"mCode\" id=\"mCode\" placeholder=\"Código\">\n          <input type=\"text\" name=\"mDesc\" id=\"mDesc\" placeholder=\"Artículo\">\n          <input type=\"text\" name=\"mRef\" id=\"mRef\" placeholder=\"Referencia (opcional)\">\n          <input type=\"text\" name=\"mLoc\" id=\"mLoc\" placeholder=\"Ubicación (ej. Pasillo 3 - B2)\" list=\"ubicacionesList\">\n          <input type=\"number\" name=\"mQty\" id=\"mQty\" placeholder=\"Cant.\" min=\"1\" value=\"1\">\n          <select id=\"mCategoria\">\n            <option value=\"\">Categoría…</option>\n            " + _0x23f5f6.map(_0x37c48c => "<option value=\"" + _0x1d1ab0(_0x37c48c) + "\">" + _0x1d1ab0(_0x37c48c) + "</option>").join("") + "\n          </select>\n          <button class=\"cam-btn\" id=\"addManualBtn\">+ Registrar entrada</button>\n        </div>\n      </div>\n    <button class=\"cam-btn\" id=\"almacenMasOpcionesBtn\" style=\"width:100%; margin-top:10px;\">" + (_0x1c3cca.masOp ? "Ocultar opciones" : "Más opciones (bobinas, cables…)") + "</button>\n    <div id=\"almacenMasOpcionesZone\" style=\"" + (_0x1c3cca.masOp ? "" : "display:none;") + "\"></div>\n    ";
    (function () {
      const _0xzonaMasOp = $("#almacenMasOpcionesZone");
      if (_0xzonaMasOp) {
        _0xzonaMasOp.insertAdjacentHTML("beforeend", _0x4abf6f());
        _0xzonaMasOp.insertAdjacentHTML("beforeend", _0xa19f12());
      }
    })();
    _0x231638.querySelectorAll("[data-select-id]").forEach(_0x3deadb => {
      _0x3deadb.addEventListener("change", _0x116b01 => {
        if (_0x116b01.target.checked) {
          _0xf103fd.add(_0x3deadb.dataset.selectId);
        } else {
          _0xf103fd.delete(_0x3deadb.dataset.selectId);
        }
        _0x1c3cca();
      });
    });
    const _0x3da4db = $("#bulkLocBtn");
    if (_0x3da4db) {
      _0x3da4db.addEventListener("click", async () => {
        const _0x52e198 = await _0x3b375f("Nueva ubicación para " + _0xf103fd.size + " referencias:");
        if (_0x52e198 === null) {
          return;
        }
        _0xf103fd.forEach(_0x2a94f1 => {
          const _0x3a8019 = estado.catalog.find(_0x3e2afc => _0x3e2afc.id === _0x2a94f1);
          if (_0x3a8019) {
            _0x3a8019.location = _0x52e198.trim();
          }
        });
        guardarCatalogo();
        _0xf103fd.clear();
        render();
      });
    }
    const _0x385c8e = $("#bulkQtyBtn");
    if (_0x385c8e) {
      _0x385c8e.addEventListener("click", async () => {
        const _0x1f1b25 = await _0x3b375f("Nueva cantidad para las " + _0xf103fd.size + " referencias seleccionadas (se pone igual en todas):");
        if (_0x1f1b25 === null) {
          return;
        }
        const _0x3e2b29 = Math.max(0, parseInt(_0x1f1b25, 10) || 0);
        _0xf103fd.forEach(_0x4ef393 => {
          const _0x49e930 = estado.catalog.find(_0x46f4d4 => _0x46f4d4.id === _0x4ef393);
          if (!_0x49e930) {
            return;
          }
          const _0x1fd639 = _0x3e2b29 - _0x49e930.qty;
          if (_0x1fd639 !== 0) {
            _0x1d4277(_0x49e930, Math.abs(_0x1fd639), _0x1fd639 > 0 ? "entrada" : "salida", "Almacén (ajuste manual en bloque)");
          }
        });
        _0xf103fd.clear();
        render();
      });
    }
    const _0x3b8195 = $("#bulkDelBtn");
    if (_0x3b8195) {
      _0x3b8195.addEventListener("click", async () => {
        if (!(await _0x2cc777("¿Eliminar " + _0xf103fd.size + " referencias del stock? Esta acción no se puede deshacer."))) {
          return;
        }
        _0xf103fd.forEach(_0xd8313f => {
          const _0x2cd8fe = estado.catalog.find(_0x2a0608 => _0x2a0608.id === _0xd8313f);
          if (_0x2cd8fe) {
            estado.movements.unshift({
              id: nuevoId(),
              code: _0x2cd8fe.code,
              desc: _0x2cd8fe.desc,
              qty: _0x2cd8fe.qty,
              type: "eliminado",
              origin: "Almacén (eliminación en bloque)",
              ts: fechaHoraTexto(),
              tsMs: Date.now(),
              usuario: usuarioActual()
            });
          }
        });
        _0x240f8a();
        estado.catalog = estado.catalog.filter(_0x35723d => !_0xf103fd.has(_0x35723d.id));
        guardarCatalogo();
        _0xf103fd.clear();
        render();
      });
    }
    const _0x4b7670 = $("#stockFiltroCategoriaSel");
    if (_0x4b7670) {
      _0x4b7670.addEventListener("change", _0x11b118 => {
        _0x1b0226 = _0x11b118.target.value;
        _0x2ba7a9 = 80;
        _0x1c3cca();
      });
    }
    const _0x131899 = $("#stockFiltroBajoChk");
    if (_0x131899) {
      _0x131899.addEventListener("change", _0x4a487d => {
        _0x30947e = _0x4a487d.target.checked;
        _0x2ba7a9 = 80;
        _0x1c3cca();
      });
    }
    const _0x369228 = $("#stockFiltroSinUbicarChk");
    if (_0x369228) {
      _0x369228.addEventListener("change", _0x5379b9 => {
        _0x101019 = _0x5379b9.target.checked;
        _0x2ba7a9 = 80;
        _0x1c3cca();
      });
    }
    const _0x123302 = $("#stockFiltroLimpiarBtn");
    if (_0x123302) {
      _0x123302.addEventListener("click", () => {
        _0x1b0226 = "";
        _0x30947e = false;
        _0x101019 = false;
        _0x2ba7a9 = 80;
        _0x1c3cca();
      });
    }
    const _0x453712 = $("#selectAllStock");
    if (_0x453712) {
      _0x453712.checked = _0x1318d4.length > 0 && _0x1318d4.every(_0x5be985 => _0xf103fd.has(_0x5be985.id));
      _0x453712.addEventListener("change", () => {
        if (_0x453712.checked) {
          _0x1318d4.forEach(_0x158615 => _0xf103fd.add(_0x158615.id));
        } else {
          _0x1318d4.forEach(_0x3141d4 => _0xf103fd.delete(_0x3141d4.id));
        }
        _0x1c3cca();
      });
    }
    const _0x1d77ce = $("#stockLoadMoreBtn");
    if (_0x1d77ce) {
      _0x1d77ce.addEventListener("click", () => {
        _0x2ba7a9 += 80;
        _0x1c3cca();
      });
    }
    _0x231638.querySelectorAll("[data-edit-btn]").forEach(_0x2cbdb1 => {
      _0x2cbdb1.addEventListener("click", () => _0x243f07(_0x2cbdb1.dataset.editBtn));
    });
    _0x231638.querySelectorAll("[data-qty-btn]").forEach(_0x57690c => {
      _0x57690c.addEventListener("click", () => _0x4fac24(_0x57690c.dataset.qtyBtn));
    });
    $("#addManualBtn").addEventListener("click", () => {
      _0x5a53db($("#mCode").value, $("#mDesc").value, $("#mQty").value, $("#mLoc").value, $("#mCategoria").value, $("#mRef").value);
      $("#mCode").value = "";
      $("#mDesc").value = "";
      $("#mRef").value = "";
      $("#mLoc").value = "";
      $("#mQty").value = "1";
      $("#mCategoria").value = "";
      $("#mCode").focus({
        preventScroll: true
      });
    });
    $("#addBobinaBtn").addEventListener("click", () => {
      _0x3af2da($("#bCodigo").value, $("#bDesc").value, $("#bMatricula").value, $("#bFecha").value);
      $("#bCodigo").value = "";
      $("#bDesc").value = "";
      $("#bMatricula").value = "";
      $("#bFecha").value = "";
    });
    const _0xe68aab = $("#bCodigo");
    if (_0xe68aab) {
      _0xe68aab.addEventListener("change", () => {
        const _0x3982e4 = buscarPorCodigo(_0xe68aab.value.trim());
        if (_0x3982e4 && !$("#bDesc").value.trim()) {
          $("#bDesc").value = _0x3982e4.desc;
        }
      });
      _0xe68aab.addEventListener("keydown", _0x1dbe15 => {
        if (_0x1dbe15.key === "Enter") {
          _0x1dbe15.preventDefault();
          _0xe68aab.dispatchEvent(new Event("change"));
          $("#bMatricula").focus({
            preventScroll: true
          });
        }
      });
    }
    const _0x501dc9 = $("#bCamBtn");
    if (_0x501dc9) {
      _0x501dc9.addEventListener("click", () => _0xe99bca(_0x593f14 => {
        $("#bCodigo").value = _0x593f14;
        _0xe68aab.dispatchEvent(new Event("change"));
      }));
    }
    _0x231638.querySelectorAll("[data-bobina-del]").forEach(_0x2c5cc8 => {
      _0x2c5cc8.addEventListener("click", () => _0x5d5280(_0x2c5cc8.dataset.bobinaDel));
    });
    const _0x4d4219 = $("#cablesSearch");
    if (_0x4d4219) {
      _0x4d4219.addEventListener("input", () => {
        _0x506050 = _0x4d4219.value;
        _0x2436d1();
      });
    }
    _0x2436d1();
    const _0x4b290d = $("#addCableBtn");
    if (_0x4b290d) {
      _0x4b290d.addEventListener("click", () => {
        _0x5a53db($("#cabCodigo").value, $("#cabArticulo").value, $("#cabQty").value, $("#cabLoc").value, "Manguera o cable", $("#cabRef").value);
        $("#cabCodigo").value = "";
        $("#cabArticulo").value = "";
        $("#cabRef").value = "";
        $("#cabQty").value = "1";
        $("#cabLoc").value = "";
      });
    }
    const _0xbtnMasOpAlmacen = $("#almacenMasOpcionesBtn");
    if (_0xbtnMasOpAlmacen) {
      _0xbtnMasOpAlmacen.addEventListener("click", () => {
        _0x1c3cca.masOp = !_0x1c3cca.masOp;
        _0x1c3cca();
      });
    }
    (function () {
      let __filtrosPanel = null;
      let __anadirPanel = null;
      _0x231638.querySelectorAll(".panel").forEach(function (__p) {
        const __t = __p.querySelector(".panel-title");
        if (!__t) {
          return;
        }
        const __tt = __t.textContent.trim();
        if (__tt === "Filtros") {
          __filtrosPanel = __p;
        } else if (__tt === "Añadir stock manualmente") {
          __anadirPanel = __p;
        }
      });
      if (__filtrosPanel) {
        const __show = !!_0x1c3cca.masFiltros;
        __filtrosPanel.style.display = __show ? "" : "none";
        if (__anadirPanel) {
          __anadirPanel.style.display = __show ? "" : "none";
        }
        const __btn = document.createElement("button");
        __btn.className = "cam-btn";
        __btn.style.cssText = "width:100%; margin-bottom:14px;";
        __btn.textContent = __show ? "Ocultar filtros y añadir stock manualmente" : "Filtros y añadir stock manualmente";
        __btn.addEventListener("click", function () {
          _0x1c3cca.masFiltros = !_0x1c3cca.masFiltros;
          _0x1c3cca();
        });
        __filtrosPanel.parentNode.insertBefore(__btn, __filtrosPanel);
      }
    })();
  }
  function _0x4abf6f() {
    const _0x13f80e = estado.bobinas.slice().sort((_0x17c289, _0x1c45a7) => _0x17c289.expira.localeCompare(_0x1c45a7.expira));
    const _0x380069 = _0x13f80e.map(_0x5d3d4d => {
      const _0x58412e = _0x1a6d34(_0x5d3d4d.expira);
      const _0x135633 = _0x58412e < 0 ? "low" : _0x58412e <= estado.settings.bobinaAvisoDias ? "low" : "ok";
      const _0x5a615f = _0x58412e < 0 ? "vencida hace " + Math.abs(_0x58412e) + " días" : _0x58412e === 0 ? "vence hoy" : "quedan " + _0x58412e + " días";
      return "\n        <div class=\"stock-row\">\n          <div class=\"row-main\">\n            <div class=\"row-code\">" + (_0x1d1ab0(_0x5d3d4d.codigo) || "—") + " · " + _0x1d1ab0(_0x5d3d4d.matricula) + "</div>\n            <div class=\"row-desc\">" + _0x1d1ab0(_0x5d3d4d.desc) + "</div>\n            <div class=\"row-ts\">Devolver antes del " + _0x5d3d4d.expira + " — " + _0x5a615f + "</div>\n          </div>\n          <div class=\"row-actions\">\n            <span class=\"stock-qty " + _0x135633 + "\">" + (_0x58412e < 0 ? "Vencida: " : "") + _0x5d3d4d.expira + "</span>\n            <button class=\"btn-return\" style=\"padding:9px 14px; font-size:13px; min-height:44px;\" data-bobina-del=\"" + _0x5d3d4d.id + "\">" + _0x56ae2b("eliminar") + "Eliminar</button>\n          </div>\n        </div>\n      ";
    }).join("");
    return "\n      <div class=\"panel\" style=\"margin-top:14px;\">\n        <p class=\"panel-title\">Bobinas (con fecha de devolución)</p>\n        <div class=\"manual-stock-form\">\n          <input type=\"text\" id=\"bCodigo\" placeholder=\"Código\">\n          <button class=\"cam-btn\" id=\"bCamBtn\" style=\"flex:none; padding:9px 12px;\">Cám.</button>\n          <input type=\"text\" id=\"bDesc\" placeholder=\"Referencia\" style=\"flex:2; min-width:140px;\">\n          <input type=\"text\" id=\"bMatricula\" placeholder=\"Matrícula\" style=\"flex:1; min-width:100px;\">\n          <input type=\"date\" id=\"bFecha\" style=\"flex:1; min-width:150px;\">\n          <button class=\"cam-btn\" id=\"addBobinaBtn\">+ Registrar bobina</button>\n        </div>\n        <div class=\"scan-hint\" style=\"margin-top:6px;\">Si el código ya existe en stock, la referencia se rellena sola.</div>\n      </div>\n\n      <div class=\"ticket\" style=\"margin-top:14px;\">\n        <div class=\"ticket-header\">\n          <span class=\"ticket-title\">Bobinas registradas</span>\n          <span class=\"ticket-title\">" + estado.bobinas.length + "</span>\n        </div>\n        <div class=\"ticket-body\">\n          " + (_0x380069 || "<div class=\"empty-state\">Todavía no hay bobinas registradas.</div>") + "\n        </div>\n      </div>\n    ";
  }
  function _0xa19f12() {
    return "\n      <div class=\"panel\" style=\"margin-top:14px;\">\n        <p class=\"panel-title\">Cables y mangueras</p>\n        <input type=\"text\" id=\"cablesSearch\" placeholder=\"Buscar entre los cables/mangueras que ya tengo en stock…\" value=\"" + _0x1d1ab0(_0x506050) + "\" style=\"width:100%; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:9px 10px; border-radius:7px; font-size:13px; margin-bottom:8px;\">\n        <div id=\"cablesResults\" style=\"max-height:240px; overflow-y:auto;\"></div>\n        <p class=\"panel-title\" style=\"margin-top:12px;\">Añadir uno nuevo</p>\n        <div class=\"manual-stock-form\">\n          <input type=\"text\" id=\"cabCodigo\" placeholder=\"Código\">\n          <input type=\"text\" id=\"cabArticulo\" placeholder=\"Artículo (ej. Manguera hidráulica 1/2\\\")\" style=\"flex:2; min-width:140px;\">\n          <input type=\"text\" id=\"cabRef\" placeholder=\"Referencia (opcional)\">\n          <input type=\"text\" id=\"cabLoc\" placeholder=\"Ubicación\" list=\"ubicacionesList\">\n          <input type=\"number\" id=\"cabQty\" placeholder=\"Cant.\" min=\"1\" value=\"1\">\n          <button class=\"cam-btn\" id=\"addCableBtn\">+ Registrar</button>\n        </div>\n      </div>\n    ";
  }
  function _0x2436d1() {
    const _0xd3cc54 = $("#cablesResults");
    if (!_0xd3cc54) {
      return;
    }
    const _0x4ea45e = _0x506050.trim().toLowerCase();
    const _0x28a956 = estado.catalog.filter(_0x3d421b => _0x3d421b.categoria === "Manguera o cable");
    const _0x1171a5 = _0x4ea45e ? _0x28a956.filter(_0x1c72ee => _0x1c72ee.code.toLowerCase().includes(_0x4ea45e) || _0x1c72ee.desc.toLowerCase().includes(_0x4ea45e) || _0x1c72ee.referencia && _0x1c72ee.referencia.toLowerCase().includes(_0x4ea45e)) : _0x28a956;
    if (!_0x1171a5.length) {
      _0xd3cc54.innerHTML = "<div style=\"color:var(--text-faint); font-size:12px; padding:6px 0;\">" + (_0x28a956.length ? "Sin coincidencias." : "Todavía no hay cables ni mangueras dados de alta en el stock.") + "</div>";
      return;
    }
    _0xd3cc54.innerHTML = _0x1171a5.slice(0, 25).map(_0x3b1b1e => "\n      <div class=\"stock-row\">\n        <div class=\"row-main\">\n          <div class=\"row-code\">" + _0x1d1ab0(_0x3b1b1e.code) + "</div>\n          <div class=\"row-desc\">" + _0x1d1ab0(_0x3b1b1e.desc) + "</div>\n        </div>\n        <div class=\"row-actions\">\n          <span class=\"stock-loc " + (_0x3b1b1e.location ? "set" : "unset") + "\">" + (_0x1d1ab0(_0x3b1b1e.location) || "Sin ubicar") + "</span>\n          <span class=\"stock-qty " + (_0x3b1b1e.qty > 0 ? "ok" : "low") + "\">" + _0x3b1b1e.qty + "</span>\n        </div>\n      </div>\n    ").join("");
  }
  let _0x4a2938 = "chat";
  const _0x539500 = [{
    nombre: "Cambio de aceite y filtro",
    km: 10000,
    meses: 12
  }, {
    nombre: "Filtro de aire",
    km: 15000,
    meses: 24
  }, {
    nombre: "Filtro de habitáculo",
    km: 15000,
    meses: 12
  }, {
    nombre: "Rotación de neumáticos",
    km: 10000,
    meses: null
  }, {
    nombre: "Pastillas de freno",
    km: 30000,
    meses: null
  }, {
    nombre: "Líquido de frenos",
    km: null,
    meses: 24
  }, {
    nombre: "Líquido refrigerante",
    km: 60000,
    meses: 48
  }, {
    nombre: "Correa de distribución",
    km: 100000,
    meses: 60
  }, {
    nombre: "Batería",
    km: null,
    meses: 48
  }, {
    nombre: "ITV / Inspección técnica",
    km: null,
    meses: 12
  }];
  function _0x5300fc(_0x204a3d, _0x3d1c85, _0x4b4989) {
    return new Promise((_0x5566fc, _0x27cf59) => {
      const _0x324cee = new FileReader();
      _0x324cee.onload = _0x282bf7 => {
        const _0x337891 = new Image();
        _0x337891.onload = () => {
          let _0x5dbfee = _0x337891.width;
          let _0x2a9c22 = _0x337891.height;
          if (_0x5dbfee > _0x2a9c22 && _0x5dbfee > _0x3d1c85) {
            _0x2a9c22 = Math.round(_0x2a9c22 * _0x3d1c85 / _0x5dbfee);
            _0x5dbfee = _0x3d1c85;
          } else if (_0x2a9c22 > _0x3d1c85) {
            _0x5dbfee = Math.round(_0x5dbfee * _0x3d1c85 / _0x2a9c22);
            _0x2a9c22 = _0x3d1c85;
          }
          const _0x3b314c = document.createElement("canvas");
          _0x3b314c.width = _0x5dbfee;
          _0x3b314c.height = _0x2a9c22;
          _0x3b314c.getContext("2d").drawImage(_0x337891, 0, 0, _0x5dbfee, _0x2a9c22);
          _0x5566fc(_0x3b314c.toDataURL("image/jpeg", _0x4b4989));
        };
        _0x337891.onerror = () => _0x27cf59(new Error("No se pudo leer la imagen"));
        _0x337891.src = _0x282bf7.target.result;
      };
      _0x324cee.onerror = () => _0x27cf59(new Error("No se pudo leer el archivo"));
      _0x324cee.readAsDataURL(_0x204a3d);
    });
  }
  function _0x3aef53() {
    if (estado.mode !== "resumen") {
      return;
    }
    const _0x124d8e = $("#mainList");
    const _0x128c7f = _0x2df77d() === "taller";
    const _0x5527ac = _0x41ba69();
    const _0x63a743 = _0x3fdd17();
    const _0x408293 = estado.notifications.filter(_0x35cd1f => !_0x35cd1f.leida && (_0x35cd1f.para || "almacen") === _0x2df77d()).length;
    const _0xb6e9f6 = estado.groups.montaje.filter(_0xaae45c => _0xaae45c.status !== "finalizado").length + estado.groups.proyecto.filter(_0x169122 => _0x169122.status !== "finalizado").length;
    const _0x55e7ed = _0x4fc746();
    const _0x2984ca = _0x55e7ed.filter(_0x4fd852 => _0x4fd852.estado === "atrasada").length;
    const _0x3f4a9c = (_0x49a493, _0x45e06e, _0x251358, _0x2c285a, _0x6ea3c5) => "\n      <div class=\"panel\" style=\"border-top:4px solid " + _0x49a493 + "; cursor:pointer;\" data-ir-a=\"" + _0x6ea3c5 + "\">\n        <p class=\"panel-title\" style=\"margin-bottom:2px;\">" + _0x45e06e + "</p>\n        <div style=\"display:flex; align-items:baseline; gap:8px;\">\n          <span style=\"font-size:26px; font-weight:800; color:" + _0x49a493 + "; font-family:ui-monospace,monospace;\">" + _0x251358 + "</span>\n          <span style=\"font-size:12px; color:var(--text-faint);\">" + _0x2c285a + "</span>\n        </div>\n      </div>\n    ";
    _0x124d8e.innerHTML = "\n      <div style=\"margin-bottom:12px;\">\n        <p style=\"font-size:12px; color:var(--text-faint); margin:0;\">Lo más urgente de un vistazo — toca cualquier tarjeta para ir directo ahí.</p>\n      </div>\n      " + (_0x128c7f ? "" : _0x3f4a9c(_0x5527ac.length || _0x63a743.length ? "var(--danger)" : "var(--success)", "Almacén", _0x5527ac.length, _0x5527ac.length === 1 ? "material con stock bajo" : "materiales con stock bajo", "almacen")) + "\n      " + (!_0x128c7f && _0x63a743.length ? _0x3f4a9c("var(--warning)", "Bobinas", _0x63a743.length, _0x63a743.length === 1 ? "a punto de expirar" : "a punto de expirar", "almacen") : "") + "\n      " + _0x3f4a9c(_0x408293 ? "var(--accent)" : "var(--success)", "Trabajo", _0x408293, (_0x408293 === 1 ? "aviso sin leer" : "avisos sin leer") + " · " + _0xb6e9f6 + " orden(es) activa(s)", "trabajo") + "\n      " + _0x3f4a9c(estado.pedidoItems.length ? "var(--accent)" : "var(--success)", "Reponer", estado.pedidoItems.length, estado.pedidoItems.length === 1 ? "línea pendiente" : "líneas pendientes", "pedido") + "\n      " + (estado.vehiculos.length ? _0x3f4a9c(_0x2984ca ? "var(--danger)" : _0x55e7ed.length ? "var(--warning)" : "var(--success)", "Mantenimiento", _0x55e7ed.length, _0x2984ca ? _0x2984ca + " atrasada(s)" : "revisión(es) pendiente(s)", "mantenimiento") : "") + "\n    ";
    _0x124d8e.querySelectorAll("[data-ir-a]").forEach(_0x26ba70 => {
      _0x26ba70.addEventListener("click", () => {
        if (_0x128c7f && _0x26ba70.dataset.irA === "almacen") {
          return;
        }
        estado.mode = _0x26ba70.dataset.irA === "trabajo" ? _0x1e9600 : _0x26ba70.dataset.irA;
        _0x430fb2();
        render();
      });
    });
  }
  function _0x327d31() {
    if (estado.mode !== "mantenimiento") {
      return;
    }
    const _0x101ace = $("#mainList");
    if (!estado.vehiculos.length) {
      _0x101ace.innerHTML = "\n        <div class=\"project-bar\">\n          <button class=\"cam-btn\" id=\"addVehiculoBtn\" style=\"flex:1;\">+ Añadir vehículo</button>\n        </div>\n        <div class=\"empty-state\">Todavía no hay ningún vehículo. Añade el primero para empezar a llevar su mantenimiento.</div>\n      ";
      $("#addVehiculoBtn").addEventListener("click", _0x4f1e92);
      return;
    }
    const _0x1972b3 = _0x267a5a() || estado.vehiculos[0];
    if (_0x1972b3.id !== estado.vehiculoActualId) {
      estado.vehiculoActualId = _0x1972b3.id;
      _0x430fb2();
    }
    const _0x2e9928 = _0x1972b3.kmActual || 0;
    const _0x36c069 = _0x4f0ebd(_0x1972b3.id).map(_0x3b00cd => ({
      ..._0x3b00cd,
      calc: _0x22e6c7(_0x3b00cd, _0x2e9928)
    }));
    _0x36c069.sort((_0x36e08e, _0x2c22fc) => _0x36e08e.calc.urgencia - _0x2c22fc.calc.urgencia);
    const _0x5df632 = _0x36c069.filter(_0x5af261 => _0x5af261.calc.estado === "atrasada").length;
    const _0x409ede = _0x36c069.filter(_0x107869 => _0x107869.calc.estado === "pronto").length;
    const _0x17692b = _0x36c069.filter(_0x468f35 => _0x468f35.calc.estado === "ok").length;
    _0x101ace.innerHTML = "\n      <div class=\"project-bar\">\n        <select id=\"vehiculoSelect\" style=\"flex:1;\">\n          " + estado.vehiculos.map(_0x5d2845 => "<option value=\"" + _0x5d2845.id + "\" " + (_0x5d2845.id === _0x1972b3.id ? "selected" : "") + ">" + _0x1d1ab0(_0x5d2845.matricula) + (_0x5d2845.marca || _0x5d2845.modelo ? " — " + _0x1d1ab0(_0x5d2845.marca || "") + " " + _0x1d1ab0(_0x5d2845.modelo || "") : "") + "</option>").join("") + "\n        </select>\n        <button class=\"cam-btn\" id=\"addVehiculoBtn\" style=\"flex:none; padding:9px 14px; min-height:auto;\">+ Nuevo</button>\n      </div>\n      <div class=\"project-bar\" style=\"margin-top:0;\">\n        <label for=\"kmActualInput\" style=\"font-size:12px; font-weight:700; color:var(--text-faint); white-space:nowrap;\">Km actuales:</label>\n        <input type=\"number\" id=\"kmActualInput\" value=\"" + _0x2e9928 + "\" min=\"0\" style=\"flex:1;\">\n        <button class=\"cam-btn\" id=\"editVehiculoBtn\" style=\"flex:none; padding:9px 14px; min-height:auto;\">" + _0x56ae2b("editar") + "Editar</button>\n        <button class=\"btn-return\" id=\"delVehiculoBtn\" style=\"flex:none; padding:9px 14px; min-height:auto;\">Eliminar vehículo</button>\n      </div>\n\n      <div class=\"panel\">\n        <p class=\"panel-title\">Resumen</p>\n        <div class=\"stat-row\"><span>Atrasadas</span><span class=\"num\" style=\"color:var(--danger);\">" + _0x5df632 + "</span></div>\n        <div class=\"stat-row\"><span>Pronto</span><span class=\"num\" style=\"color:var(--warning);\">" + _0x409ede + "</span></div>\n        <div class=\"stat-row\"><span>Al día</span><span class=\"num\" style=\"color:var(--success);\">" + _0x17692b + "</span></div>\n      </div>\n\n      <div class=\"ticket\" style=\"margin-top:14px;\">\n        <div class=\"ticket-header\"><span class=\"ticket-title\">Mantenimiento — " + _0x1d1ab0(_0x1972b3.matricula) + "</span></div>\n        <div class=\"ticket-body\">\n          " + (_0x36c069.length ? _0x36c069.map(_0xa8f528).join("") : "<div class=\"empty-state\">Añade la primera tarea de mantenimiento abajo.</div>") + "\n        </div>\n      </div>\n      <button class=\"cam-btn\" id=\"addTareaMantBtn\" style=\"width:100%; margin-top:10px;\">+ Añadir tarea de mantenimiento</button>\n\n      <div class=\"ticket\" style=\"margin-top:14px;\">\n        <div class=\"ticket-header\" id=\"toggleFotosBtn\" style=\"cursor:pointer;\">\n          <span class=\"ticket-title\">Fotos de " + _0x1d1ab0(_0x1972b3.matricula) + ((_0x1972b3.fotos || []).length ? " (" + _0x1972b3.fotos.length + ")" : "") + "</span>\n          <span class=\"ticket-title\">" + (_0xcbd78e ? "Ocultar" : "Ver") + "</span>\n        </div>\n        " + (_0xcbd78e ? "\n        <div class=\"ticket-body\">\n          " + ((_0x1972b3.fotos || []).length ? "\n          <div style=\"display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:8px; padding:12px 14px;\">\n            " + (_0x1972b3.fotos || []).map((_0x13fec3, _0x235626) => "\n              <div style=\"position:relative;\">\n                <img src=\"" + _0x13fec3 + "\" style=\"width:100%; aspect-ratio:1; object-fit:cover; border-radius:6px; border:1px solid var(--border); cursor:pointer;\" data-ver-foto=\"" + _0x235626 + "\">\n                <button class=\"btn-return\" data-del-foto=\"" + _0x235626 + "\" style=\"position:absolute; top:2px; right:2px; padding:2px 6px; font-size:10px; min-height:auto;\">×</button>\n              </div>\n            ").join("") + "\n          </div>\n          " : "<div class=\"empty-state\">Todavía no hay ninguna foto de este vehículo.</div>") + "\n          <div style=\"padding:0 14px 14px;\">\n            <input type=\"file\" id=\"fotoInput\" accept=\"image/*\" capture=\"environment\" style=\"display:none;\">\n            <button class=\"cam-btn\" id=\"addFotoBtn\" style=\"width:100%;\">+ Añadir foto</button>\n          </div>\n        </div>\n        " : "") + "\n      </div>\n    ";
    $("#vehiculoSelect").addEventListener("change", _0x21152f => {
      estado.vehiculoActualId = _0x21152f.target.value;
      _0x430fb2();
      render();
    });
    $("#addVehiculoBtn").addEventListener("click", _0x4f1e92);
    $("#editVehiculoBtn").addEventListener("click", () => _0x4f1e92(_0x1972b3.id));
    $("#delVehiculoBtn").addEventListener("click", async () => {
      if (!(await _0x2cc777("¿Eliminar \"" + _0x1972b3.matricula + "\" y todas sus tareas de mantenimiento? No se puede deshacer."))) {
        return;
      }
      estado.vehiculos = estado.vehiculos.filter(_0x5d4fa8 => _0x5d4fa8.id !== _0x1972b3.id);
      estado.tareasMantenimiento = estado.tareasMantenimiento.filter(_0x1cc00c => _0x1cc00c.vehiculoId !== _0x1972b3.id);
      estado.vehiculoActualId = estado.vehiculos.length ? estado.vehiculos[0].id : null;
      _0x932e35();
      _0x3e790f();
      _0x430fb2();
      render();
    });
    $("#kmActualInput").addEventListener("change", _0x21f1df => {
      _0x1972b3.kmActual = Math.max(0, parseInt(_0x21f1df.target.value, 10) || 0);
      _0x932e35();
      render();
    });
    $("#addTareaMantBtn").addEventListener("click", () => _0x5e4b81());
    _0x101ace.querySelectorAll("[data-hecho-tarea-id]").forEach(_0x19763e => {
      _0x19763e.addEventListener("click", () => _0x38920a(_0x19763e.dataset.hechoTareaId));
    });
    _0x101ace.querySelectorAll("[data-del-tarea-id]").forEach(_0x2acfe8 => {
      _0x2acfe8.addEventListener("click", async () => {
        if (!(await _0x2cc777("¿Eliminar esta tarea de mantenimiento?"))) {
          return;
        }
        estado.tareasMantenimiento = estado.tareasMantenimiento.filter(_0x77ee06 => _0x77ee06.id !== _0x2acfe8.dataset.delTareaId);
        _0x3e790f();
        render();
      });
    });
    _0x101ace.querySelectorAll("[data-editar-tarea-id]").forEach(_0x2bb84b => {
      _0x2bb84b.addEventListener("click", () => _0x5e4b81(_0x2bb84b.dataset.editarTareaId));
    });
    const _0x4bcdb4 = $("#toggleFotosBtn");
    if (_0x4bcdb4) {
      _0x4bcdb4.addEventListener("click", () => {
        _0xcbd78e = !_0xcbd78e;
        render();
      });
    }
    const _0x3cb796 = $("#fotoInput");
    if (_0x3cb796) {
      $("#addFotoBtn").addEventListener("click", () => _0x3cb796.click());
      _0x3cb796.addEventListener("change", async () => {
        const _0x11fc60 = _0x3cb796.files[0];
        if (!_0x11fc60) {
          return;
        }
        _0x279f78("Guardando foto…");
        try {
          const _0x310082 = await _0x5300fc(_0x11fc60, 1000, 0.6);
          _0x1972b3.fotos = _0x1972b3.fotos || [];
          _0x1972b3.fotos.unshift(_0x310082);
          if (_0x1972b3.fotos.length > 30) {
            _0x1972b3.fotos = _0x1972b3.fotos.slice(0, 30);
          }
          _0x932e35();
          render();
        } catch (_0x1720ba) {
          _0x279f78("No se pudo guardar la foto: " + _0x1720ba.message);
        }
        _0x3cb796.value = "";
      });
    }
    _0x101ace.querySelectorAll("[data-ver-foto]").forEach(_0x586e06 => {
      _0x586e06.addEventListener("click", () => _0x42c913(_0x586e06.src));
    });
    _0x101ace.querySelectorAll("[data-del-foto]").forEach(_0x45e8cc => {
      _0x45e8cc.addEventListener("click", async () => {
        if (!(await _0x2cc777("¿Eliminar esta foto?"))) {
          return;
        }
        _0x1972b3.fotos.splice(parseInt(_0x45e8cc.dataset.delFoto, 10), 1);
        _0x932e35();
        render();
      });
    });
  }
  function _0xa8f528(_0x5f1501) {
    const _0x53bc6b = _0x5f1501.calc;
    const _0x317941 = _0x53bc6b.estado === "atrasada" ? "var(--danger)" : _0x53bc6b.estado === "pronto" ? "var(--warning)" : "var(--success)";
    const _0x30cf5a = _0x53bc6b.estado === "atrasada" ? "Atrasada" : _0x53bc6b.estado === "pronto" ? "Pronto" : "Al día";
    const _0x21b7b9 = [];
    if (_0x5f1501.intervaloKm) {
      _0x21b7b9.push("cada " + _0x5f1501.intervaloKm.toLocaleString("es-ES") + " km");
    }
    if (_0x5f1501.intervaloMeses) {
      _0x21b7b9.push("cada " + _0x5f1501.intervaloMeses + " meses");
    }
    const _0x24c3f3 = [];
    if (_0x5f1501.ultimoKm != null) {
      _0x24c3f3.push(_0x5f1501.ultimoKm.toLocaleString("es-ES") + " km");
    }
    if (_0x5f1501.ultimaFecha) {
      _0x24c3f3.push(new Date(_0x5f1501.ultimaFecha + "T00:00:00").toLocaleDateString("es-ES"));
    }
    const _0x151dfb = [];
    if (_0x53bc6b.proximoKm != null) {
      _0x151dfb.push(_0x53bc6b.proximoKm.toLocaleString("es-ES") + " km");
    }
    if (_0x53bc6b.proximaFecha) {
      _0x151dfb.push(new Date(_0x53bc6b.proximaFecha + "T00:00:00").toLocaleDateString("es-ES"));
    }
    return "\n      <div style=\"display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px dashed var(--border); border-top:3px solid " + _0x317941 + ";\">\n        <div style=\"flex:1; min-width:0; cursor:pointer;\" data-editar-tarea-id=\"" + _0x5f1501.id + "\">\n          <div style=\"font-weight:700; font-size:13.5px;\">" + _0x1d1ab0(_0x5f1501.nombre) + "</div>\n          <div style=\"font-size:11.5px; color:var(--text-faint); margin-top:2px;\">" + (_0x21b7b9.join(" · ") || "sin intervalo definido") + (_0x24c3f3.length ? " · última vez: " + _0x24c3f3.join(" · ") : "") + "</div>\n        </div>\n        <div style=\"text-align:right; flex:none;\">\n          <span style=\"font-size:10.5px; font-weight:700; padding:3px 9px; border-radius:20px; background:color-mix(in srgb, " + _0x317941 + " 16%, transparent); color:" + _0x317941 + ";\">" + _0x30cf5a + "</span>\n          <div style=\"font-size:11px; color:var(--text-faint); margin-top:4px; font-family:ui-monospace,monospace;\">" + (_0x151dfb.join(" · ") || "—") + "</div>\n        </div>\n        <div style=\"display:flex; flex-direction:column; gap:4px; flex:none;\">\n          <button class=\"cam-btn\" data-hecho-tarea-id=\"" + _0x5f1501.id + "\" style=\"padding:6px 10px; font-size:11px; min-height:auto;\">Hecho</button>\n          <button class=\"btn-return\" data-del-tarea-id=\"" + _0x5f1501.id + "\" style=\"padding:6px 10px; font-size:11px; min-height:auto;\">" + _0x56ae2b("eliminar") + "Eliminar</button>\n        </div>\n      </div>\n    ";
  }
  function _0x4f1e92(_0x3a87c0) {
    const _0x5c555c = _0x3a87c0 ? estado.vehiculos.find(_0x10c01b => _0x10c01b.id === _0x3a87c0) : null;
    const _0x3d40a2 = $("#mantOverlay");
    const _0xdb2066 = $("#mantOverlayCard");
    _0xdb2066.innerHTML = "\n      <p class=\"panel-title\">" + (_0x5c555c ? "Editar vehículo" : "Añadir vehículo") + "</p>\n      <div class=\"scanner-row\" style=\"margin-bottom:8px;\">\n        <input type=\"text\" id=\"vMatricula\" placeholder=\"Matrícula\" value=\"" + (_0x5c555c ? _0x1d1ab0(_0x5c555c.matricula || "") : "") + "\" style=\"flex:1;\">\n        <input type=\"number\" id=\"vKm\" placeholder=\"Km actuales\" min=\"0\" value=\"" + (_0x5c555c ? _0x5c555c.kmActual || 0 : "") + "\" style=\"flex:1;\">\n      </div>\n      <div class=\"scanner-row\" style=\"margin-bottom:12px;\">\n        <input type=\"text\" id=\"vMarca\" placeholder=\"Marca\" value=\"" + (_0x5c555c ? _0x1d1ab0(_0x5c555c.marca || "") : "") + "\" style=\"flex:1;\">\n        <input type=\"text\" id=\"vModelo\" placeholder=\"Modelo\" value=\"" + (_0x5c555c ? _0x1d1ab0(_0x5c555c.modelo || "") : "") + "\" style=\"flex:1;\">\n        <input type=\"number\" id=\"vAnio\" placeholder=\"Año\" value=\"" + (_0x5c555c ? _0x1d1ab0(_0x5c555c.anio || "") : "") + "\" style=\"flex:1;\">\n      </div>\n      <p style=\"font-size:11.5px; color:var(--text-faint); margin:0 0 6px 2px;\">Mecánico habitual (opcional)</p>\n      <div class=\"scanner-row\" style=\"margin-bottom:12px;\">\n        <input type=\"text\" id=\"vMecanicoNombre\" placeholder=\"Nombre o taller\" value=\"" + (_0x5c555c ? _0x1d1ab0(_0x5c555c.mecanicoNombre || "") : "") + "\" style=\"flex:1;\">\n        <input type=\"text\" id=\"vMecanicoContacto\" placeholder=\"Teléfono o email\" value=\"" + (_0x5c555c ? _0x1d1ab0(_0x5c555c.mecanicoContacto || "") : "") + "\" style=\"flex:1;\">\n      </div>\n      <div class=\"scanner-row\">\n        <button class=\"btn-return\" id=\"vCancelar\" style=\"flex:1;\">Cancelar</button>\n        <button class=\"btn primary\" id=\"vGuardar\" style=\"flex:1;\">" + (_0x5c555c ? "Guardar" : "Añadir") + "</button>\n      </div>\n    ";
    _0x3d40a2.style.display = "flex";
    $("#vCancelar").addEventListener("click", () => _0x3d40a2.style.display = "none");
    $("#vGuardar").addEventListener("click", () => {
      const _0x303798 = $("#vMatricula").value.trim();
      if (!_0x303798) {
        _0x279f78("Escribe la matrícula del vehículo.");
        return;
      }
      const _0x1e95c8 = {
        matricula: _0x303798,
        marca: $("#vMarca").value.trim(),
        modelo: $("#vModelo").value.trim(),
        anio: $("#vAnio").value.trim(),
        kmActual: Math.max(0, parseInt($("#vKm").value, 10) || 0),
        mecanicoNombre: $("#vMecanicoNombre").value.trim(),
        mecanicoContacto: $("#vMecanicoContacto").value.trim()
      };
      if (_0x5c555c) {
        Object.assign(_0x5c555c, _0x1e95c8);
      } else {
        const _0x749646 = {
          id: nuevoId(),
          fotos: [],
          ..._0x1e95c8
        };
        estado.vehiculos.push(_0x749646);
        estado.vehiculoActualId = _0x749646.id;
        _0x430fb2();
      }
      _0x932e35();
      _0x3d40a2.style.display = "none";
      render();
    });
  }
  function _0x5e4b81(_0x11c1ae) {
    const _0xf3330b = _0x267a5a();
    if (!_0xf3330b) {
      return;
    }
    const _0x2863cd = _0x11c1ae ? estado.tareasMantenimiento.find(_0x4df2ce => _0x4df2ce.id === _0x11c1ae) : null;
    const _0x17dfae = $("#mantOverlay");
    const _0x25238d = $("#mantOverlayCard");
    _0x25238d.innerHTML = "\n      <p class=\"panel-title\">" + (_0x2863cd ? "Editar tarea" : "Añadir tarea de mantenimiento") + "</p>\n      " + (!_0x2863cd ? "\n      <select id=\"tPreset\" style=\"width:100%; margin-bottom:8px;\">\n        <option value=\"\">— Escribir a mano —</option>\n        " + _0x539500.map((_0xa5a8d8, _0x43f4a0) => "<option value=\"" + _0x43f4a0 + "\">" + _0x1d1ab0(_0xa5a8d8.nombre) + "</option>").join("") + "\n      </select>\n      " : "") + "\n      <input type=\"text\" id=\"tNombre\" placeholder=\"Nombre de la tarea\" value=\"" + (_0x2863cd ? _0x1d1ab0(_0x2863cd.nombre) : "") + "\" style=\"width:100%; margin-bottom:8px;\">\n      <div class=\"scanner-row\" style=\"margin-bottom:8px;\">\n        <input type=\"number\" id=\"tKm\" placeholder=\"Cada cuántos km\" min=\"0\" value=\"" + (_0x2863cd && _0x2863cd.intervaloKm ? _0x2863cd.intervaloKm : "") + "\" style=\"flex:1;\">\n        <input type=\"number\" id=\"tMeses\" placeholder=\"Cada cuántos meses\" min=\"0\" value=\"" + (_0x2863cd && _0x2863cd.intervaloMeses ? _0x2863cd.intervaloMeses : "") + "\" style=\"flex:1;\">\n      </div>\n      <p style=\"font-size:11.5px; color:var(--text-faint); margin:-4px 0 10px;\">Rellena uno de los dos, o los dos — avisa con lo que llegue antes.</p>\n      <div class=\"scanner-row\" style=\"margin-bottom:12px;\">\n        <input type=\"number\" id=\"tUltimoKm\" placeholder=\"Km la última vez\" min=\"0\" value=\"" + (_0x2863cd && _0x2863cd.ultimoKm != null ? _0x2863cd.ultimoKm : _0xf3330b.kmActual || 0) + "\" style=\"flex:1;\">\n        <input type=\"date\" id=\"tUltimaFecha\" value=\"" + (_0x2863cd && _0x2863cd.ultimaFecha ? _0x2863cd.ultimaFecha : _0x535f33()) + "\" style=\"flex:1;\">\n      </div>\n      <div class=\"scanner-row\">\n        <button class=\"btn-return\" id=\"tCancelar\" style=\"flex:1;\">Cancelar</button>\n        <button class=\"btn primary\" id=\"tGuardar\" style=\"flex:1;\">" + (_0x2863cd ? "Guardar" : "Añadir") + "</button>\n      </div>\n    ";
    _0x17dfae.style.display = "flex";
    const _0x4b99ab = $("#tPreset");
    if (_0x4b99ab) {
      _0x4b99ab.addEventListener("change", () => {
        if (_0x4b99ab.value === "") {
          return;
        }
        const _0x5a851b = _0x539500[parseInt(_0x4b99ab.value, 10)];
        $("#tNombre").value = _0x5a851b.nombre;
        $("#tKm").value = _0x5a851b.km || "";
        $("#tMeses").value = _0x5a851b.meses || "";
      });
    }
    $("#tCancelar").addEventListener("click", () => _0x17dfae.style.display = "none");
    $("#tGuardar").addEventListener("click", () => {
      const _0x84cb62 = $("#tNombre").value.trim();
      if (!_0x84cb62) {
        _0x279f78("Escribe el nombre de la tarea.");
        return;
      }
      const _0x285ac4 = parseInt($("#tKm").value, 10);
      const _0x12b1cb = parseInt($("#tMeses").value, 10);
      if (!_0x285ac4 && !_0x12b1cb) {
        _0x279f78("Indica al menos un intervalo, en km o en meses, para poder avisarte.");
        return;
      }
      const _0x5a728c = {
        nombre: _0x84cb62,
        intervaloKm: _0x285ac4 || null,
        intervaloMeses: _0x12b1cb || null,
        ultimoKm: $("#tUltimoKm").value !== "" ? parseInt($("#tUltimoKm").value, 10) : null,
        ultimaFecha: $("#tUltimaFecha").value || null
      };
      if (_0x2863cd) {
        Object.assign(_0x2863cd, _0x5a728c);
      } else {
        estado.tareasMantenimiento.push({
          id: nuevoId(),
          vehiculoId: _0xf3330b.id,
          ..._0x5a728c
        });
      }
      _0x3e790f();
      _0x17dfae.style.display = "none";
      render();
    });
  }
  function _0x38920a(_0x13996c) {
    const _0x4fd70c = estado.tareasMantenimiento.find(_0x287f0d => _0x287f0d.id === _0x13996c);
    const _0xeece32 = _0x267a5a();
    if (!_0x4fd70c || !_0xeece32) {
      return;
    }
    const _0x3a73ee = $("#mantOverlay");
    const _0x7d155b = $("#mantOverlayCard");
    _0x7d155b.innerHTML = "\n      <p class=\"panel-title\">Marcar \"" + _0x1d1ab0(_0x4fd70c.nombre) + "\" como hecho</p>\n      <div class=\"scanner-row\" style=\"margin-bottom:12px;\">\n        <input type=\"number\" id=\"dKm\" placeholder=\"Km en ese momento\" min=\"0\" value=\"" + (_0xeece32.kmActual || 0) + "\" style=\"flex:1;\">\n        <input type=\"date\" id=\"dFecha\" value=\"" + _0x535f33() + "\" style=\"flex:1;\">\n      </div>\n      <div class=\"scanner-row\">\n        <button class=\"btn-return\" id=\"dCancelar\" style=\"flex:1;\">Cancelar</button>\n        <button class=\"btn primary\" id=\"dGuardar\" style=\"flex:1;\">" + _0x56ae2b("guardar") + "Guardar</button>\n      </div>\n    ";
    _0x3a73ee.style.display = "flex";
    $("#dCancelar").addEventListener("click", () => _0x3a73ee.style.display = "none");
    $("#dGuardar").addEventListener("click", () => {
      _0x4fd70c.ultimoKm = Math.max(0, parseInt($("#dKm").value, 10) || 0);
      _0x4fd70c.ultimaFecha = $("#dFecha").value || _0x535f33();
      if (_0x4fd70c.ultimoKm > (_0xeece32.kmActual || 0)) {
        _0xeece32.kmActual = _0x4fd70c.ultimoKm;
        _0x932e35();
      }
      _0x3e790f();
      _0x3a73ee.style.display = "none";
      render();
    });
  }
  function _0x4a9ee1() {
    if (estado.mode !== "pedido") {
      return;
    }
    const _0x3a71dc = $("#mainList");
    const _0x1538e9 = estado.pedidoItems.map(_0x49a1a4 => "\n      <div class=\"ticket-row\" data-id=\"" + _0x49a1a4.id + "\">\n        <div class=\"row-main\">\n          <div class=\"row-code\">" + _0x1d1ab0(_0x49a1a4.code) + "</div>\n          <div class=\"row-desc\">" + _0x1d1ab0(_0x49a1a4.desc) + "</div>\n        </div>\n        <div class=\"row-qty\">x" + _0x49a1a4.qty + "</div>\n        <button class=\"btn-return\" data-pedido-del=\"" + _0x49a1a4.id + "\">Quitar</button>\n      </div>\n    ").join("");
    const _0x5976cf = "\n      <div class=\"scanner-row\" style=\"margin-bottom:10px; flex-wrap:wrap;\">\n        <button class=\"mode-btn\" data-pedido-view=\"chat\" style=\"flex:none; padding:8px 16px; " + (_0x4a2938 === "chat" ? "background:var(--accent); color:#2A0800;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">Chat</button>\n        <button class=\"mode-btn\" data-pedido-view=\"lista\" style=\"flex:none; padding:8px 16px; " + (_0x4a2938 === "lista" ? "background:var(--accent); color:#2A0800;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">Lista (" + estado.pedidoItems.length + ")</button>\n      </div>\n    ";
    const _0x3e2599 = _0x4a2938 === "chat" ? "\n      <div class=\"ticket\">\n        <div class=\"ticket-header\"><span class=\"ticket-title\">Chat</span></div>\n        <div class=\"ticket-body\">" + _0x17a460(estado.pedidoChat) + "</div>\n        <div style=\"display:flex; gap:6px; padding:10px 14px; border-top:1px solid var(--border);\">\n          <input type=\"text\" id=\"chatMensajeInput\" placeholder=\"Describe qué hace falta pedir…\" style=\"flex:2; min-width:0;\">\n          <input type=\"number\" id=\"chatCantidadInput\" placeholder=\"Uds\" min=\"1\" value=\"1\" style=\"flex:none; width:64px;\">\n          <button class=\"btn primary\" id=\"chatEnviarBtn\" style=\"width:auto; flex:none;\">" + _0x56ae2b("enviar") + "Enviar</button>\n        </div>\n      </div>\n    " : "\n      <div class=\"ticket\">\n        <div class=\"ticket-header\">\n          <span class=\"ticket-title\">Pedido de materiales</span>\n          <span class=\"ticket-title\">" + estado.pedidoItems.length + " referencias</span>\n        </div>\n        <div class=\"ticket-body\">\n          " + (_0x1538e9 || "<div class=\"empty-state\">Todavía no has añadido nada al pedido. Escanea o busca un material del stock para empezar.</div>") + "\n        </div>\n      </div>\n    ";
    _0x3a71dc.innerHTML = _0x5976cf + _0x3e2599;
    _0x10279f(_0x3a71dc);
    _0x3a71dc.querySelectorAll("[data-pedido-view]").forEach(_0x363990 => {
      _0x363990.addEventListener("click", () => {
        _0x4a2938 = _0x363990.dataset.pedidoView;
        _0x4a9ee1();
      });
    });
    const _0x1e3e46 = $("#chatEnviarBtn");
    if (_0x1e3e46) {
      _0x1e3e46.addEventListener("click", _0x36610a);
    }
    const _0x4dfed2 = $("#chatMensajeInput");
    if (_0x4dfed2) {
      _0x4dfed2.addEventListener("keydown", _0x16542a => {
        if (_0x16542a.key === "Enter") {
          _0x16542a.preventDefault();
          _0x36610a();
        }
      });
    }
    _0x3a71dc.querySelectorAll("[data-pedido-del]").forEach(_0x2ecbbd => {
      _0x2ecbbd.addEventListener("click", () => _0x10dfbf(_0x2ecbbd.dataset.pedidoDel));
    });
  }
  function _0x8db8ba() {
    _0x8db8ba_impl();
    __clasifPostRender();
  }
  function _0x8db8ba_impl() {
    let _0x5f4a21 = null;
    if (estado.mode !== "montaje" && estado.mode !== "proyecto") {
      return;
    }
    const _0x1b7047 = $("#mainList");
    const _0x196921 = _0x33d6d2();
    const _0x4368d0 = _0x1ea037();
    if (!_0x4368d0) {
      _0x1b7047.innerHTML = _0x196921 + "<div class=\"empty-state\">Selecciona una orden o proyecto arriba, o crea uno nuevo, para empezar a registrar material.</div>";
      _0x241b98(_0x1b7047);
      return;
    }
    const _0xe5dca9 = _0x2df77d() === "taller";
    if (_0xe5dca9 && (_0x5592da === "servido" || _0x5592da === "devuelto")) {
      _0x5592da = "hoja";
    }
    const _0x222547 = _0x5592da !== "hoja" && _0x4368d0.pendiente.items.length ? "\n      <div class=\"ticket\" style=\"margin-bottom:14px; border-color:var(--accent);\">\n        <div class=\"ticket-header\">\n          <span class=\"ticket-title\">Solicitud pendiente de recoger</span>\n          <span class=\"ticket-title\">" + _0x4368d0.pendiente.items.length + " referencias</span>\n        </div>\n        <div class=\"ticket-body\">\n          " + _0x4368d0.pendiente.items.map(_0xebbac1 => "\n            <div class=\"ticket-row\" data-id=\"" + _0xebbac1.id + "\">\n              <div class=\"row-main\">\n                <div class=\"row-code\">" + (_0xebbac1.textoLibre ? "(sin referencia)" : _0x1d1ab0(_0xebbac1.code)) + " " + (_0xebbac1.reservado ? "<span class=\"tag-entrada\" style=\"margin-left:4px;\">Reservado</span>" : "") + "</div>\n                <div class=\"row-desc\">" + (_0xebbac1.textoLibre ? "<em>" + _0x1d1ab0(_0xebbac1.textoLibre) + "</em>" : _0x1d1ab0(_0xebbac1.desc)) + "</div>\n              </div>\n              <div class=\"row-qty\">x" + _0xebbac1.qty + "</div>\n              <button class=\"btn-return\" data-pendiente-del=\"" + _0xebbac1.id + "\">Quitar</button>\n            </div>\n          ").join("") + "\n        </div>\n      </div>\n      " + (_0xe5dca9 ? "" : "<button class=\"btn primary\" id=\"prepareGroupDeliveryBtn\" style=\"margin-bottom:14px;\">" + (_0x4368d0.pendiente.items.some(_0x6d729f => _0x6d729f.reservado) ? "Ir a firmar la recogida" : "Preparar recogida y firmar") + "</button>") + "\n    " : "";
    // Franja con el estado del pedido de esta orden: lo primero que necesita saber el taller
    const __cuentaEstados = new Map();
    _0x4368d0.pendiente.items.forEach(__l => {
      const __e = TecnomatDatos.estadoLinea(__l);
      __cuentaEstados.set(__e.clave, { texto: __e.texto, n: ((__cuentaEstados.get(__e.clave) || {}).n || 0) + 1 });
    });
    if (_0x4368d0.servido.length) {
      __cuentaEstados.set("recogido", { texto: "Recogido", n: _0x4368d0.servido.length });
    }
    const __franjaEstado = __cuentaEstados.size ? "<div class=\"franja-estado\" role=\"status\"><b>Estado del pedido</b>" + [...__cuentaEstados].map(([__k, __v]) => "<span class=\"estado-linea\" data-estado=\"" + __k + "\">" + __v.n + " · " + __v.texto + "</span>").join("") + "</div>" : "";
    const _0x2616e9 = __franjaEstado + "\n      <div class=\"chat-tabs-row\" style=\"margin-bottom:10px;\">\n        <button class=\"mode-btn\" data-view=\"chat\" style=\"flex:none; padding:8px 16px; " + (_0x5592da === "chat" ? "background:var(--accent); color:#150A28;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">Chat</button>\n        <button class=\"mode-btn\" data-view=\"hoja\" style=\"flex:none; padding:8px 16px; " + (_0x5592da === "hoja" ? "background:var(--accent); color:#150A28;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">Hoja de pedido</button>\n        " + (_0xe5dca9 ? "" : "\n        <button class=\"mode-btn\" data-view=\"servido\" style=\"flex:none; padding:8px 16px; " + (_0x5592da === "servido" ? "background:var(--accent); color:#150A28;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">Servido (" + _0x4368d0.servido.length + ")</button>\n        <button class=\"mode-btn\" data-view=\"devuelto\" style=\"flex:none; padding:8px 16px; " + (_0x5592da === "devuelto" ? "background:var(--accent); color:#150A28;" : "background:var(--bg-panel); border:1px solid var(--border);") + "\">Devuelto (" + _0x4368d0.devuelto.length + ")</button>\n        ") + "\n      </div>\n    ";
    let _0x4895bf;
    if (_0x5592da === "chat") {
      _0x4895bf = "\n        <div class=\"ticket\">\n          <div class=\"ticket-header\">\n            <span class=\"ticket-title\">Chat</span>\n          </div>\n          <div class=\"ticket-body\">" + _0x17a460(_0x4368d0.chat, {
        target: _0x4368d0,
        puedeAsociar: !_0xe5dca9
      }) + "</div>\n          " + (estado.materialesRapidos.length ? "\n          <div style=\"padding:10px 14px; border-top:1px solid var(--border);\">\n            <p style=\"font-size:11px; font-weight:700; color:var(--text-faint); text-transform:uppercase; letter-spacing:.03em; margin:0 0 8px 2px;\">Lista rápida</p>\n            <div style=\"display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;\">\n              " + estado.materialesRapidos.map(_0x2fccc7 => "\n                <label style=\"display:flex; align-items:center; gap:8px; font-size:12.5px;\">\n                  <input type=\"checkbox\" class=\"rapido-check\" aria-label=\"Añadir este material\" data-rapido-id=\"" + _0x2fccc7.id + "\" style=\"width:16px; height:16px; flex:none;\">\n                  <span style=\"flex:1;\">" + _0x1d1ab0(_0x2fccc7.nombre) + "</span>\n                  <input type=\"number\" class=\"rapido-qty\" aria-label=\"Cantidad\" data-rapido-qty=\"" + _0x2fccc7.id + "\" value=\"1\" min=\"1\" style=\"width:52px; flex:none;\">\n                </label>\n              ").join("") + "\n            </div>\n            <button class=\"cam-btn\" id=\"anadirRapidosBtn\" style=\"width:100%; margin-top:8px;\">Añadir seleccionados</button>\n          </div>\n          " : "") + "\n          <div style=\"display:flex; gap:6px; padding:10px 14px; border-top:1px solid var(--border);\">\n            <textarea id=\"chatMensajeInput\" rows=\"2\" placeholder=\"Escribe qué hace falta: un artículo por línea o separados por comas…\" style=\"flex:2; min-width:0;\"></textarea>\n            <button type=\"button\" id=\"chatReservaToggleBtn\" class=\"cam-btn\" style=\"flex:none; padding:8px 12px; font-size:12px;\">Reserva</button>\n            <button class=\"btn primary\" id=\"chatEnviarBtn\" style=\"width:auto; flex:none;\">" + _0x56ae2b("enviar") + "Enviar</button>\n          </div>\n        </div>\n      ";
    } else if (_0x5592da === "hoja") {
      const _0x2b90c7 = estado.current[estado.mode] || "";
      const _0x4b4727 = _0x4368d0.pendiente.items.map(_0x358905 => ({
        id: _0x358905.id,
        esPendiente: true,
        estado: TecnomatDatos.estadoLinea(_0x358905),
        fecha: _0x358905.fechaGuardado || fechaHoraTexto(),
        articulo: _0x358905.textoLibre ? "" : _0x358905.code + " — " + _0x358905.desc,
        referencia: _0x358905.textoLibre ? "" : _0x358905.referencia || "",
        textoLibre: _0x358905.textoLibre || "",
        cantidad: _0x358905.qty,
        pedido: _0x358905.pedido ?? _0x358905.qty,
        reserva: _0x358905.reserva ?? 0,
        recibido: "",
        escandalloPedido: _0x358905.escandalloPedido || "",
        escandalloPedidoNumero: _0x358905.escandalloPedidoNumero || "",
        destino: _0x358905.destino || "",
        proveedorNombre: _0x358905.proveedorNombre || "",
        recibidoCantidad: _0x358905.recibidoCantidad ?? null,
        pendienteReclamar: !!_0x358905.pendienteReclamar,
        avisoDevolverReserva: !!_0x358905.avisoDevolverReserva,
        bloqueada: !!_0x358905.guardado && !!_0xe5dca9
      }));
      const _0x2576c3 = _0x4368d0.servido.map(_0x35a5b4 => ({
        id: _0x35a5b4.id,
        esPendiente: false,
        estado: TecnomatDatos.estadoLinea(_0x35a5b4, true),
        fecha: _0x35a5b4.firstTs || _0x35a5b4.ts,
        articulo: _0x35a5b4.code + " — " + _0x35a5b4.desc,
        referencia: _0x35a5b4.referencia || "",
        textoLibre: "",
        cantidad: _0x35a5b4.qty,
        pedido: _0x35a5b4.qty,
        reserva: _0x35a5b4.qty,
        recibido: _0x35a5b4.firstTs || _0x35a5b4.ts,
        escandalloPedido: _0x35a5b4.escandalloPedido || "",
        escandalloPedidoNumero: _0x35a5b4.escandalloPedidoNumero || "",
        destino: _0x35a5b4.destino || "",
        proveedorNombre: _0x35a5b4.proveedorNombre || "",
        recibidoCantidad: _0x35a5b4.recibidoCantidad ?? null,
        pendienteReclamar: !!_0x35a5b4.pendienteReclamar,
        avisoDevolverReserva: !!_0x35a5b4.avisoDevolverReserva,
        bloqueada: true
      }));
      _0x5f4a21 = [..._0x4b4727, ..._0x2576c3];
      _0x4895bf = "\n        <div class=\"ticket\">\n          <div class=\"ticket-header\">\n            <span class=\"ticket-title\">Hoja de pedido de materiales</span>\n            <span class=\"ticket-title\">OT: " + _0x1d1ab0(_0x2b90c7) + ((buscarGrupo(estado.mode, _0x2b90c7) || {}).tipo ? " · " + _0x1d1ab0(buscarGrupo(estado.mode, _0x2b90c7).tipo) : "") + "</span>\n          </div>\n          <div style=\"display:flex; align-items:center; gap:8px; padding:10px 14px; border-bottom:1px solid var(--border);\">\n            <label for=\"hojaPlanoInput\" style=\"font-size:12px; font-weight:700; color:var(--text-faint); white-space:nowrap;\">Plano:</label>\n            <input type=\"text\" id=\"hojaPlanoInput\" placeholder=\"Nº de plano de toda la orden\" value=\"" + _0x1d1ab0((buscarGrupo(estado.mode, _0x2b90c7) || {}).plano || "") + "\" style=\"flex:1;\">\n          </div>\n          <div class=\"ticket-body\" style=\"overflow-x:auto;\">\n            " + (_0x5f4a21.length ? "\n            " + (!_0xe5dca9 ? "\n            <div class=\"scanner-row\" style=\"margin-bottom:8px; align-items:center;\">\n              <span style=\"font-size:12px; color:var(--text-faint); flex:1;\">" + (_0x236c29.size ? _0x236c29.size + " línea(s) seleccionada(s)" : "Marca varias líneas para ponerles Escandallo/Pedido a la vez") + "</span>\n              " + (_0x236c29.size ? "\n                <button class=\"cam-btn\" id=\"marcarEscandalloBtn\" style=\"flex:none;\">Marcar como Escandallo</button>\n                <button class=\"cam-btn\" id=\"marcarPedidoBtn\" style=\"flex:none;\">Marcar como Pedido</button>\n                <button class=\"btn-return\" id=\"quitarMarcaBtn\" style=\"flex:none;\">Quitar marca</button>\n                <button class=\"cam-btn\" id=\"marcarProveedorBtn\" style=\"flex:none;\">Enviar a Proveedor</button>\n                <button class=\"cam-btn\" id=\"marcarHojaBtn\" style=\"flex:none;\">Volver a Hoja de pedido</button>\n              " : "") + "\n            </div>\n            " : "") + "\n            <table class=\"hoja-pedido-table\">\n              <thead>\n                <tr>" + "<th></th>" + "<th>OT</th><th>Fecha</th><th>Artículo</th><th>Referencia</th><th>Cantidad</th><th>Reserva</th><th>Escandallo/Pedido</th><th>Recibido</th></tr>\n              </thead>\n              <tbody>\n                " + _0x5f4a21.map(_0x9b12df => {
        const __placa = "<span class=\"estado-linea\" data-estado=\"" + _0x9b12df.estado.clave + "\">" + _0x9b12df.estado.texto + "</span> ";
        const _0x3570ca = __placa + (_0x9b12df.textoLibre ? "<em>" + _0x1d1ab0(_0x9b12df.textoLibre) + "</em> <span style=\"color:var(--danger); font-size:10.5px;\">(sin referencia)</span>" : _0x1d1ab0(_0x9b12df.articulo));
        const _0x1f8e54 = _0x9b12df.textoLibre ? _0xe5dca9 ? "—" : "<button class=\"cam-btn\" style=\"padding:7px 12px; font-size:12px;\" data-asignar-ref=\"" + _0x9b12df.id + "\">Asignar referencia</button>" : _0x1d1ab0(_0x9b12df.referencia);
        const _0x175e6b = _0xe5dca9 ? _0x9b12df.escandalloPedido ? _0x1d1ab0(_0x9b12df.escandalloPedido) + (_0x9b12df.escandalloPedidoNumero ? " Nº " + _0x1d1ab0(_0x9b12df.escandalloPedidoNumero) : "") : "—" : "\n                        <select class=\"hoja-num\" data-hoja-id=\"" + _0x9b12df.id + "\" data-hoja-texto=\"escandalloPedido\" aria-label=\"Escandallo o pedido\" style=\"margin-bottom:4px;\">\n                          <option value=\"\" " + (!_0x9b12df.escandalloPedido ? "selected" : "") + ">—</option>\n                          <option value=\"Escandallo\" " + (_0x9b12df.escandalloPedido === "Escandallo" ? "selected" : "") + ">Escandallo</option>\n                          <option value=\"Pedido\" " + (_0x9b12df.escandalloPedido === "Pedido" ? "selected" : "") + ">Pedido</option>\n                        </select>\n                        <input type=\"text\" value=\"" + _0x1d1ab0(_0x9b12df.escandalloPedidoNumero) + "\" class=\"hoja-num\" data-hoja-id=\"" + _0x9b12df.id + "\" data-hoja-texto=\"escandalloPedidoNumero\" aria-label=\"Número de escandallo o pedido\" placeholder=\"Nº\" style=\"min-width:80px;\">\n                      ";
        if (!_0x9b12df.esPendiente || _0x9b12df.bloqueada) {
          return "\n                    <tr style=\"opacity:.75;\">\n                      " + (_0xe5dca9 ? "<td></td>" : "<td><input type=\"checkbox\" class=\"hoja-select\" aria-label=\"Seleccionar línea\" data-select-hoja-id=\"" + _0x9b12df.id + "\" " + (_0x236c29.has(_0x9b12df.id) ? "checked" : "") + " style=\"width:16px; height:16px;\"></td>") + "\n                      <td>" + _0x1d1ab0(_0x2b90c7) + "</td>\n                      <td>" + _0x9b12df.fecha + "</td>\n                      <td class=\"col-articulo\">" + _0x3570ca + "</td>\n                      <td>" + _0x1f8e54 + "</td>\n                      <td>" + _0x9b12df.cantidad + "</td>\n                      <td>" + _0x9b12df.reserva + "</td>\n                      <td>" + _0x175e6b + "</td>\n                      <td style=\"text-align:center;\">" + (_0x9b12df.esPendiente ? "" : "<input type=\"checkbox\" checked disabled> " + _0x9b12df.recibido) + "</td>\n                    </tr>";
        }
        return "\n                    <tr>\n                      " + (_0xe5dca9 ? "<td></td>" : "<td><input type=\"checkbox\" class=\"hoja-select\" aria-label=\"Seleccionar línea\" data-select-hoja-id=\"" + _0x9b12df.id + "\" " + (_0x236c29.has(_0x9b12df.id) ? "checked" : "") + " style=\"width:16px; height:16px;\"></td>") + "\n                      <td>" + _0x1d1ab0(_0x2b90c7) + "</td>\n                      <td>" + _0x9b12df.fecha + "</td>\n                      <td class=\"col-articulo\">" + _0x3570ca + "</td>\n                      <td>" + _0x1f8e54 + "</td>\n                      <td><input type=\"number\" min=\"0\" value=\"" + _0x9b12df.cantidad + "\" class=\"hoja-num\" data-hoja-id=\"" + _0x9b12df.id + "\" data-hoja-campo=\"qty\" aria-label=\"Cantidad\"></td>\n                      <td><input type=\"number\" min=\"0\" value=\"" + _0x9b12df.reserva + "\" class=\"hoja-num\" data-hoja-id=\"" + _0x9b12df.id + "\" data-hoja-campo=\"reserva\" aria-label=\"Reserva\"></td>\n                      <td>" + _0x175e6b + "</td>\n                      <td style=\"text-align:center;\">" + (_0xe5dca9 ? "—" : "<input type=\"checkbox\" data-hoja-recibido=\"" + _0x9b12df.id + "\">") + "</td>\n                    </tr>";
      }).join("") + "\n              </tbody>\n            </table>\n            <button class=\"cam-btn\" id=\"addFreeTextBtn\" style=\"margin-top:8px;\">+ No sé la referencia — escribir qué hace falta</button>\n            " + (_0x4368d0.pendiente.items.length ? "\n              <p style=\"font-size:11px; color:var(--text-faint); margin:10px 0 0 0;\">" + (_0xe5dca9 ? "Rellena y pulsa \"Guardar\" — almacén prepara y firma la recogida." : "\"Recibido\" abre la firma de recogida de toda la solicitud.") + "</p>\n              <button class=\"btn primary\" id=\"saveHojaPedidoBtn\" style=\"margin-top:8px;\">Guardar y avisar a almacén</button>\n            " : "") + "\n            " : "<div class=\"empty-state\">Todavía no hay nada pedido ni servido en esta orden/proyecto.</div>") + "\n          </div>\n        </div>\n      ";
    } else if (_0x5592da === "devuelto") {
      const _0x2d3031 = _0x4368d0.devuelto.map(_0x192b63 => "\n        <div class=\"devuelto-row\">\n          <div>\n            <div class=\"row-code\" style=\"font-size:13px;\">" + _0x1d1ab0(_0x192b63.code) + "</div>\n            <div style=\"color:var(--text-muted);\">" + _0x1d1ab0(_0x192b63.desc) + "</div>\n            <div class=\"row-ts\">Entregado: " + (_0x192b63.deliveredAt || "—") + "</div>\n          </div>\n          <span class=\"tag-devuelto\">x" + _0x192b63.qty + "</span>\n          <span>Devuelto: " + _0x192b63.ts + "</span>\n        </div>\n      ").join("");
      _0x4895bf = "\n        <div class=\"ticket\">\n          <div class=\"ticket-header\">\n            <span class=\"ticket-title\">Unidades devueltas</span>\n            <span class=\"ticket-title\">" + _0x4368d0.devuelto.length + " registros</span>\n          </div>\n          <div class=\"ticket-body\">\n            " + (_0x2d3031 || "<div class=\"empty-state\">Todavía no se ha devuelto ningún material.</div>") + "\n          </div>\n        </div>\n      ";
    } else {
      const _0x4d10a7 = _0x4368d0.servido.map(_0x58b9e4 => "\n        <div class=\"ticket-row\" data-id=\"" + _0x58b9e4.id + "\">\n          <div class=\"row-main\">\n            <div class=\"row-code\">" + _0x1d1ab0(_0x58b9e4.code) + "</div>\n            <div class=\"row-desc\">" + _0x1d1ab0(_0x58b9e4.desc) + "</div>\n            <div class=\"row-ts\">Entregado: " + (_0x58b9e4.firstTs || _0x58b9e4.ts) + (_0x58b9e4.ts && _0x58b9e4.firstTs && _0x58b9e4.ts !== _0x58b9e4.firstTs ? " · Actualizado: " + _0x58b9e4.ts : "") + "</div>\n          </div>\n          <div class=\"row-qty\">x" + _0x58b9e4.qty + "</div>\n          <input class=\"return-qty\" aria-label=\"Cantidad a devolver\" type=\"number\" min=\"1\" max=\"" + _0x58b9e4.qty + "\" value=\"" + _0x58b9e4.qty + "\" data-return-for=\"" + _0x58b9e4.id + "\">\n          <button class=\"cam-btn\" data-return-btn=\"" + _0x58b9e4.id + "\" aria-label=\"Devolver " + _0x1d1ab0(_0x58b9e4.code) + "\">Devolver</button>\n        </div>\n      ").join("");
      _0x4895bf = "\n        <div class=\"ticket\">\n          <div class=\"ticket-header\">\n            <span class=\"ticket-title\">" + _0x198ddf() + "</span>\n            <span class=\"ticket-title\">" + _0x4368d0.servido.length + " referencias</span>\n          </div>\n          <div class=\"ticket-body\">\n            " + (_0x4d10a7 || "<div class=\"empty-state\">Todavía no se ha registrado ningún material.</div>") + "\n          </div>\n        </div>\n      ";
    }
    const _0x37393c = _0x1a8185 ? "\n      <div class=\"panel\" style=\"border-color:var(--accent); margin-top:14px;\">\n        <p class=\"panel-title\">Material reconocido — elige a qué artículo corresponde cada línea (proveedor: " + _0x1d1ab0(_0x1a8185.proveedor) + ")</p>\n        <p style=\"font-size:11.5px; color:var(--text-faint); margin:0 0 10px 0;\">Escribe el código si corresponde a algo del stock — se sirve de verdad y descuenta esa cantidad. Si lo dejas en blanco, la línea queda como material faltante en esta orden, sin tocar el stock.</p>\n        <div style=\"max-height:320px; overflow-y:auto; margin-bottom:10px;\">\n          " + _0x1a8185.plan.map(_0x5de4e8 => "\n            <div style=\"padding:8px 0; border-bottom:1px dashed var(--border);\">\n              <div style=\"display:flex; flex-wrap:wrap; align-items:center; gap:10px;\">\n                <div style=\"order:1; flex:1; min-width:150px; font-size:12.5px; line-height:1.4;\">\"" + _0x1d1ab0(_0x5de4e8.texto) + "\"" + (_0x5de4e8.codigoSugerido ? " <span style=\"color:var(--text-faint);\">(ya se relacionó antes con " + _0x1d1ab0(_0x5de4e8.codigoSugerido) + ")</span>" : "") + "</div>\n                <input type=\"text\" list=\"catalogCodesList\" placeholder=\"Código del stock (vacío = falta)\" style=\"order:3; flex-basis:100%; width:100%; margin-top:4px; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:8px 10px; border-radius:6px; font-size:13px;\" value=\"" + _0x1d1ab0(_0x5de4e8.codigoSugerido) + "\" data-ocr-codigo=\"" + _0x5de4e8.id + "\">\n                <input type=\"number\" min=\"1\" style=\"order:2; width:78px; flex:none; text-align:center; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:8px 6px; border-radius:6px; font-size:13px;\" value=\"" + _0x5de4e8.cantidad + "\" data-ocr-cantidad=\"" + _0x5de4e8.id + "\">\n              </div>\n            </div>\n          ").join("") + "\n        </div>\n        <button class=\"btn primary\" id=\"applyOcrPlanBtn\">Confirmar</button>\n        <button class=\"btn ghost-danger\" id=\"cancelOcrPlanBtn\">Cancelar</button>\n      </div>\n    " : "";
    const _0x944ffb = (_0x4368d0.materialesFaltantes || []).length ? "\n      <div class=\"ticket\" style=\"margin-top:14px; border-left-color:var(--warning);\">\n        <div class=\"ticket-header\"><span class=\"ticket-title\">Material faltante (" + _0x4368d0.materialesFaltantes.length + ")</span></div>\n        <div class=\"ticket-body\">\n          " + _0x4368d0.materialesFaltantes.map(_0x3b0770 => "\n            <div style=\"display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px dashed var(--border);\">\n              <div style=\"flex:1; min-width:0;\">\n                <div style=\"font-weight:700; font-size:13px;\">" + _0x1d1ab0(_0x3b0770.descripcion) + "</div>\n                <div style=\"font-size:11px; color:var(--text-faint); margin-top:2px;\">" + _0x3b0770.cantidad + " uds · proveedor " + _0x1d1ab0(_0x3b0770.proveedor) + " · " + _0x3b0770.fecha + "</div>\n              </div>\n              <button class=\"cam-btn\" data-pedir-faltante=\"" + _0x3b0770.id + "\" style=\"padding:6px 10px; font-size:11px; min-height:auto;\">Pedir</button>\n              <button class=\"btn-return\" data-quitar-faltante=\"" + _0x3b0770.id + "\" style=\"padding:6px 10px; font-size:11px; min-height:auto;\">Quitar</button>\n            </div>\n          ").join("") + "\n        </div>\n      </div>\n    " : "";
    // Esquemas que manda la app hermana para esta OT (ya filtrados a https al recibirlos)
    const __esquemasOT = (buscarGrupo(estado.mode, estado.current[estado.mode] || "") || {}).esquemas || [];
    const __seccionEsquemas = __esquemasOT.length ? "\n      <div class=\"ticket\" style=\"margin-top:14px;\">\n        <div class=\"ticket-header\"><span class=\"ticket-title\">Esquemas de la OT</span><span class=\"ticket-title\">" + __esquemasOT.length + "</span></div>\n        <div class=\"ticket-body\">" + __esquemasOT.map(__e => "\n          <div style=\"display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px dashed var(--border);\"><div style=\"flex:1; min-width:0; font-weight:700; font-size:13px;\">" + _0x1d1ab0(__e.nombre) + "</div><a class=\"cam-btn\" href=\"" + _0x1d1ab0(__e.url) + "\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"padding:6px 10px; font-size:11px; min-height:auto; text-decoration:none;\">Abrir</a></div>").join("") + "\n        </div>\n      </div>\n    " : "";
    const _0x12fefa = (_0x4368d0.documentos || []).length;
    const _0x583e89 = _0x2df77d() === "taller" ? "" : "\n      <div class=\"ticket\" style=\"margin-top:14px;\">\n        <div class=\"ticket-header\" id=\"toggleDocumentosBtn\" style=\"cursor:pointer;\">\n          <span class=\"ticket-title\">Documentos escaneados" + (_0x12fefa ? " (" + _0x12fefa + ")" : "") + "</span>\n          <span class=\"ticket-title\">" + (_0x15a759 ? "Ocultar" : "Ver") + "</span>\n        </div>\n        " + (_0x15a759 ? "\n        <div class=\"ticket-body\">\n          " + (_0x12fefa ? (_0x4368d0.documentos || []).map(_0x44966c => "\n            <div style=\"display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px dashed var(--border);\">\n              <div style=\"flex:1; min-width:0;\">\n                <div style=\"font-weight:700; font-size:13px;\">" + _0x1d1ab0(_0x44966c.nombre) + "</div>\n                <div style=\"font-size:11px; color:var(--text-faint); margin-top:2px;\">" + _0x44966c.fecha + " · " + _0x44966c.paginas + " página(s)</div>\n              </div>\n              <button class=\"cam-btn\" data-ver-doc=\"" + _0x44966c.id + "\" style=\"padding:6px 10px; font-size:11px; min-height:auto;\">Ver</button>\n              <button class=\"btn-return\" data-del-doc=\"" + _0x44966c.id + "\" style=\"padding:6px 10px; font-size:11px; min-height:auto;\">" + _0x56ae2b("eliminar") + "Eliminar</button>\n            </div>\n          ").join("") : "<div class=\"empty-state\">Todavía no hay ningún documento escaneado para esta orden/proyecto.</div>") + "\n          <div style=\"padding:12px 14px;\">\n            <button class=\"cam-btn\" id=\"escanearDocBtn\" style=\"width:100%;\">Escanear documento</button>\n          </div>\n        </div>\n        " : "") + "\n      </div>\n    ";
    const __lineasProveedor = (typeof _0x5f4a21 !== "undefined" && _0x5f4a21 ? _0x5f4a21 : []).filter(__r => __r.destino === "proveedor");
    const __seccionProveedor = __lineasProveedor.length ? "\n      <div class=\"ticket\" style=\"margin-top:14px; border-left-color:var(--accent);\">\n        <div class=\"ticket-header\"><span class=\"ticket-title\">Proveedor</span><span class=\"ticket-title\">" + __lineasProveedor.length + " línea(s)</span></div>\n        <div class=\"ticket-body\">" + __lineasProveedor.map(__r => "\n          <div style=\"display:flex; align-items:center; gap:10px; padding:11px 14px; border-bottom:1px dashed var(--border);\"><div style=\"flex:1; min-width:0;\"><div style=\"font-weight:700; font-size:13px;\">" + _0x1d1ab0(__r.textoLibre ? __r.textoLibre : __r.articulo) + "</div><div style=\"font-size:11px; color:var(--text-faint); margin-top:2px;\">Cantidad: " + __r.cantidad + (__r.reserva ? " · Reserva: " + __r.reserva : "") + (__r.recibidoCantidad != null ? " · Recibido: " + __r.recibidoCantidad : "") + "</div>" + (__r.pendienteReclamar ? "<span class=\"badge\" style=\"background:var(--warning); color:#000; font-size:10px; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block;\">Pendiente-reclamar</span>" : "") + (__r.avisoDevolverReserva ? "<span class=\"badge\" style=\"background:var(--accent); color:#fff; font-size:10px; padding:2px 6px; border-radius:4px; margin-top:4px; display:inline-block; margin-left:4px;\">Para devolver a reserva</span>" : "") + "</div><input type=\"text\" placeholder=\"Proveedor\" value=\"" + _0x1d1ab0(__r.proveedorNombre || "") + "\" data-proveedor-nombre=\"" + __r.id + "\" style=\"flex:none; width:140px; font-size:12px; padding:6px 8px;\"></div>").join("") + "\n        </div>\n      </div>\n    " : "";
    const __lineasOCRProveedor = _0x1a8185 && _0x1a8185.proveedorLineas ? _0x1a8185.proveedorLineas : [];
    const __panelProveedorOCR = __lineasOCRProveedor.length ? "\n      <div class=\"panel\" style=\"border-color:var(--accent); margin-top:14px;\">\n        <p class=\"panel-title\">Proveedor — confirma cantidad recibida por línea</p>\n        <div style=\"max-height:320px; overflow-y:auto;\">" + __lineasOCRProveedor.map(__l => "\n          <div style=\"display:flex; align-items:center; gap:10px; padding:8px 0; border-bottom:1px dashed var(--border);\"><div style=\"flex:1; min-width:0; font-size:12.5px;\">" + _0x1d1ab0(__l.texto) + " <span style=\"color:var(--text-faint);\">(pedido: " + __l.cantidadPedida + ")</span></div><input type=\"number\" min=\"0\" data-ocr-proveedor-cantidad=\"" + __l.id + "\" value=\"" + __l.cantidadDetectada + "\" style=\"width:78px; flex:none; text-align:center; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:8px 6px; border-radius:6px; font-size:13px;\"></div>").join("") + "\n        </div>\n      </div>\n    " : "";
    _0x1b7047.innerHTML = _0x196921 + _0x2616e9 + _0x4895bf + _0x222547 + _0x37393c + _0x944ffb + __seccionEsquemas + _0x583e89 + __seccionProveedor + __panelProveedorOCR;
    _0x241b98(_0x1b7047);
    const _0x52c60a = $("#applyOcrPlanBtn");
    if (_0x52c60a) {
      _0x52c60a.addEventListener("click", _0xb68b);
    }
    const _0x528b87 = $("#cancelOcrPlanBtn");
    if (_0x528b87) {
      _0x528b87.addEventListener("click", _0x3e7902);
    }
    _0x1b7047.querySelectorAll("[data-pedir-faltante]").forEach(_0x28d778 => {
      _0x28d778.addEventListener("click", () => _0x1ed81c(_0x28d778.dataset.pedirFaltante));
    });
    _0x1b7047.querySelectorAll("[data-quitar-faltante]").forEach(_0x569c65 => {
      _0x569c65.addEventListener("click", () => _0x3426fa(_0x569c65.dataset.quitarFaltante));
    });
    const _0x5bc6c5 = $("#toggleDocumentosBtn");
    if (_0x5bc6c5) {
      _0x5bc6c5.addEventListener("click", () => {
        _0x15a759 = !_0x15a759;
        render();
      });
    }
    _0x10279f(_0x1b7047);
    const _0x1550c8 = $("#escanearDocBtn");
    if (_0x1550c8) {
      _0x1550c8.addEventListener("click", _0x1c65e1);
    }
    _0x1b7047.querySelectorAll("[data-ver-doc]").forEach(_0x57872 => {
      _0x57872.addEventListener("click", () => {
        const _0x2c618b = (_0x4368d0.documentos || []).find(_0x15c9fe => _0x15c9fe.id === _0x57872.dataset.verDoc);
        if (_0x2c618b) {
          _0x42c913(_0x2c618b.dataUrl);
        }
      });
    });
    _0x1b7047.querySelectorAll("[data-del-doc]").forEach(_0x5c3de6 => {
      _0x5c3de6.addEventListener("click", async () => {
        if (!(await _0x2cc777("¿Eliminar este documento escaneado?"))) {
          return;
        }
        _0x4368d0.documentos = (_0x4368d0.documentos || []).filter(_0x3a4ca8 => _0x3a4ca8.id !== _0x5c3de6.dataset.delDoc);
        _0x29f0a4();
        render();
      });
    });
    _0x1b7047.querySelectorAll("[data-pendiente-del]").forEach(_0x25d184 => {
      _0x25d184.addEventListener("click", () => {
        _0x4368d0.pendiente.items = _0x4368d0.pendiente.items.filter(_0x44f1aa => _0x44f1aa.id !== _0x25d184.dataset.pendienteDel);
        _0x29f0a4();
        render();
      });
    });
    const _0xac418 = $("#prepareGroupDeliveryBtn");
    if (_0xac418) {
      _0xac418.addEventListener("click", _0x308988);
    }
    _0x1b7047.querySelectorAll("[data-view]").forEach(_0x453e30 => {
      _0x453e30.addEventListener("click", () => {
        _0x5592da = _0x453e30.dataset.view;
        _0x8db8ba();
      });
    });
    const _0x3bed56 = $("#chatEnviarBtn");
    if (_0x3bed56) {
      _0x3bed56.addEventListener("click", _0x1b4d13);
    }
    const __btnReservaChat = $("#chatReservaToggleBtn");
    if (__btnReservaChat) {
      if (_0x1b4d13.reservaActiva) {
        __btnReservaChat.style.background = "var(--accent)";
        __btnReservaChat.style.color = "#2A0800";
        __btnReservaChat.style.borderColor = "var(--accent)";
        __btnReservaChat.textContent = "✓ Reserva";
      } else {
        __btnReservaChat.style.background = "";
        __btnReservaChat.style.color = "";
        __btnReservaChat.style.borderColor = "";
        __btnReservaChat.textContent = "Reserva";
      }
      __btnReservaChat.addEventListener("click", () => {
        _0x1b4d13.reservaActiva = !_0x1b4d13.reservaActiva;
        _0x8db8ba();
      });
    }
    const _0x5ecf7e = $("#anadirRapidosBtn");
    if (_0x5ecf7e) {
      _0x5ecf7e.addEventListener("click", _0x50972b);
    }
    _0x1b7047.querySelectorAll("[data-asociar-chat]").forEach(_0x55bc5b => {
      _0x55bc5b.addEventListener("click", () => _0x14693b(_0x55bc5b.dataset.asociarChat));
    });
    _0x1b7047.querySelectorAll("[data-return-btn]").forEach(_0x306a4d => {
      _0x306a4d.addEventListener("click", () => {
        const _0x444fa7 = _0x306a4d.dataset.returnBtn;
        const _0x5b3615 = _0x1b7047.querySelector("[data-return-for=\"" + _0x444fa7 + "\"]");
        const _0x24d819 = Math.max(1, parseInt(_0x5b3615.value, 10) || 1);
        _0x1541af(_0x444fa7, _0x24d819);
      });
    });
    _0x1b7047.querySelectorAll("[data-hoja-campo]").forEach(_0x1b7295 => {
      _0x1b7295.addEventListener("change", () => {
        const _0x28bae8 = _0x4368d0.pendiente.items.find(_0x312ba5 => _0x312ba5.id === _0x1b7295.dataset.hojaId);
        if (!_0x28bae8) {
          return;
        }
        _0x28bae8[_0x1b7295.dataset.hojaCampo] = Math.max(0, parseInt(_0x1b7295.value, 10) || 0);
      });
    });
    const _0x8c1d07 = _0x59bcaf => _0x4368d0.pendiente.items.find(_0x3c6d8e => _0x3c6d8e.id === _0x59bcaf) || _0x4368d0.servido.find(_0x495b2b => _0x495b2b.id === _0x59bcaf);
    const _0x267f02 = () => [..._0x4368d0.pendiente.items, ..._0x4368d0.servido];
    _0x1b7047.querySelectorAll("[data-hoja-texto]").forEach(_0xf0f953 => {
      _0xf0f953.addEventListener("change", () => {
        const _0x364548 = _0x8c1d07(_0xf0f953.dataset.hojaId);
        if (!_0x364548) {
          return;
        }
        _0x364548[_0xf0f953.dataset.hojaTexto] = _0xf0f953.value.trim();
        if (_0xf0f953.dataset.hojaTexto === "escandalloPedido" && _0x364548.escandalloPedido && !_0x364548.escandalloPedidoNumero) {
          const _0x31591f = _0x267f02().find(_0x689119 => _0x689119.id !== _0x364548.id && _0x689119.escandalloPedido === _0x364548.escandalloPedido && _0x689119.escandalloPedidoNumero);
          if (_0x31591f) {
            _0x364548.escandalloPedidoNumero = _0x31591f.escandalloPedidoNumero;
          }
        }
        _0x29f0a4();
        render();
      });
    });
    const _0x3814b5 = $("#hojaPlanoInput");
    if (_0x3814b5) {
      _0x3814b5.addEventListener("change", () => {
        const _0x19d718 = buscarGrupo(estado.mode, estado.current[estado.mode]);
        if (!_0x19d718) {
          return;
        }
        _0x19d718.plano = _0x3814b5.value.trim();
        guardarListaGrupos(estado.mode);
      });
    }
    _0x1b7047.querySelectorAll("[data-select-hoja-id]").forEach(_0x574282 => {
      _0x574282.addEventListener("change", () => {
        if (_0x574282.checked) {
          _0x236c29.add(_0x574282.dataset.selectHojaId);
        } else {
          _0x236c29.delete(_0x574282.dataset.selectHojaId);
        }
        render();
      });
    });
    const _0x14f824 = async _0x105a4b => {
      let _0x576a30 = "";
      if (_0x105a4b) {
        _0x576a30 = await _0x3b375f("Número de " + _0x105a4b + " para las " + _0x236c29.size + " línea(s) seleccionada(s):");
        if (_0x576a30 === null) {
          return;
        }
      }
      _0x236c29.forEach(_0x260e6f => {
        const _0x42503e = _0x8c1d07(_0x260e6f);
        if (_0x42503e) {
          _0x42503e.escandalloPedido = _0x105a4b;
          _0x42503e.escandalloPedidoNumero = _0x105a4b ? _0x576a30.trim() : "";
        }
      });
      _0x236c29.clear();
      _0x29f0a4();
      render();
    };
    const _0x196d9e = $("#marcarEscandalloBtn");
    if (_0x196d9e) {
      _0x196d9e.addEventListener("click", () => _0x14f824("Escandallo"));
    }
    const _0x413881 = $("#marcarPedidoBtn");
    if (_0x413881) {
      _0x413881.addEventListener("click", () => _0x14f824("Pedido"));
    }
    const _0x47e6a3 = $("#quitarMarcaBtn");
    if (_0x47e6a3) {
      _0x47e6a3.addEventListener("click", () => _0x14f824(""));
    }
    const __btnProveedor = $("#marcarProveedorBtn");
    if (__btnProveedor) {
      __btnProveedor.addEventListener("click", () => {
        _0x236c29.forEach(__id => {
          const __row = _0x8c1d07(__id);
          if (__row) {
            __row.destino = "proveedor";
          }
        });
        _0x236c29.clear();
        _0x29f0a4();
        render();
      });
    }
    const __btnHoja = $("#marcarHojaBtn");
    if (__btnHoja) {
      __btnHoja.addEventListener("click", () => {
        _0x236c29.forEach(__id => {
          const __row = _0x8c1d07(__id);
          if (__row) {
            __row.destino = "";
          }
        });
        _0x236c29.clear();
        _0x29f0a4();
        render();
      });
    }
    _0x1b7047.querySelectorAll("[data-proveedor-nombre]").forEach(__inp => {
      __inp.addEventListener("change", () => {
        const __row = _0x8c1d07(__inp.dataset.proveedorNombre);
        if (__row) {
          __row.proveedorNombre = __inp.value;
        }
      });
    });
    _0x1b7047.querySelectorAll("[data-hoja-recibido]").forEach(_0xc56893 => {
      _0xc56893.addEventListener("change", () => {
        _0xc56893.checked = false;
        _0x308988();
      });
    });
    const _0x1eeba0 = $("#saveHojaPedidoBtn");
    if (_0x1eeba0) {
      _0x1eeba0.addEventListener("click", () => {
        if (_0x1eeba0.disabled) {
          return;
        }
        _0x1eeba0.disabled = true;
        _0x1e1e26();
      });
    }
    const _0x4f00ec = $("#addFreeTextBtn");
    if (_0x4f00ec) {
      _0x4f00ec.addEventListener("click", _0x3b5c75);
    }
    _0x1b7047.querySelectorAll("[data-asignar-ref]").forEach(_0x5a60d4 => {
      _0x5a60d4.addEventListener("click", () => _0x14693b(_0x5a60d4.dataset.asignarRef));
    });
  }
  function _0xe20c0f() {
    const _0x13ac6b = $("#sidePanel");
    if (estado.mode === "almacen") {
      const _0x5e2d34 = estado.catalog.filter(_0x4ecd13 => _0x4ecd13.qty <= 0).length;
      const _0x3bf112 = estado.movements.slice(0, 10).map(_0xeec882 => "\n        <div class=\"movement-row\">\n          <span class=\"tag-" + _0xeec882.type + "\">" + _0x11c4a1(_0xeec882.type) + "</span>\n          <span class=\"m-code\">" + _0x1d1ab0(_0xeec882.code) + " <span style=\"color:var(--text-faint);\">x" + _0xeec882.qty + "</span></span>\n          <span style=\"color:var(--text-faint); font-size:11px;\">" + _0xeec882.ts + (_0xeec882.usuario ? " · " + _0x1d1ab0(_0xeec882.usuario) : "") + "</span>\n          <span class=\"m-desc\">" + _0x1d1ab0(_0xeec882.desc) + "</span>\n          <span class=\"m-origin\">" + _0x1d1ab0(_0xeec882.origin) + "</span>\n        </div>\n      ").join("");
      _0x13ac6b.innerHTML = "\n        <div class=\"panel\">\n          <p class=\"panel-title\">Resumen de stock</p>\n          <div class=\"stat-row\"><span>Referencias en stock</span><span class=\"num\">" + estado.catalog.length + "</span></div>\n          <div class=\"stat-row\"><span>Referencias a 0 o negativo</span><span class=\"num\">" + _0x5e2d34 + "</span></div>\n          <div class=\"stat-row\"><span>Valor total del inventario</span><span class=\"num\">" + estado.catalog.reduce((_0x338635, _0xadcaa0) => _0x338635 + (_0xadcaa0.qty > 0 ? _0xadcaa0.qty * (_0xadcaa0.coste || 0) : 0), 0).toFixed(2) + "€</span></div>\n        </div>\n\n        <div class=\"panel\">\n          <p class=\"panel-title\">Últimos movimientos</p>\n          " + (_0x3bf112 || "<div style=\"color:var(--text-faint); font-size:12.5px;\">Sin movimientos todavía.</div>") + "\n          " + (estado.movementsArchive.length ? "\n          <p style=\"font-size:11px; color:var(--text-faint); margin-top:8px;\">\n            Histórico más antiguo archivado por mes: " + estado.movementsArchive.slice(0, 3).map(_0x204573 => _0x204573.month + " (" + _0x204573.entradas + " entr. / " + _0x204573.salidas + " sal.)").join(" · ") + (estado.movementsArchive.length > 3 ? "…" : "") + "\n          </p>" : "") + "\n        </div>\n\n        <button class=\"cam-btn\" id=\"masOpcionesAlmacenBtn\" style=\"width:100%;\">" + (_0x39b15b ? "Ocultar ajustes de almacén" : "Ajustes de almacén") + "</button>\n\n        " + (_0x39b15b ? "\n        <div class=\"panel\" style=\"margin-top:14px;\">\n          <p class=\"panel-title\">Exportar / Importar</p>\n          <button class=\"btn primary\" id=\"exportStockBtn\">Exportar stock y movimientos</button>\n          <label class=\"btn\" style=\"text-align:center; display:block;\">\n            Importar catálogo (añade y actualiza, no borra)\n            <input type=\"file\" id=\"catalogFile\" accept=\".xlsx,.xls,.csv\" style=\"display:none;\">\n          </label>\n          <input type=\"text\" id=\"catalogSearch\" placeholder=\"Buscar en el stock…\" value=\"" + _0x1a8b0d + "\" style=\"width:100%; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:9px 10px; border-radius:7px; font-size:13px; margin-top:4px;\">\n        </div>\n\n        <div class=\"panel\" style=\"border-color:var(--danger);\">\n          <p class=\"panel-title\" style=\"color:var(--danger);\">Sobrescribir todo el stock</p>\n          <p style=\"font-size:11.5px; color:var(--text-faint); margin:0 0 8px 0;\">El stock queda igual que el Excel: cantidades exactas, borra lo que no esté.</p>\n          <label class=\"btn ghost-danger\" style=\"text-align:center; display:block;\">\n            Sobrescribir con este Excel\n            <input type=\"file\" id=\"overwriteCatalogFile\" accept=\".xlsx,.xls,.csv\" style=\"display:none;\">\n          </label>\n        </div>\n\n        <div class=\"panel\">\n          <p class=\"panel-title\">Copia de seguridad</p>\n          <div class=\"backup-row\">\n            <button class=\"btn\" id=\"exportBackupBtn\">Descargar todo</button>\n            <label class=\"btn\" style=\"text-align:center; display:block;\">\n              Restaurar\n              <input type=\"file\" id=\"backupFile\" accept=\".json\" style=\"display:none;\">\n            </label>\n          </div>\n        </div>\n\n        <div class=\"panel\">\n          <p class=\"panel-title\">Avisos</p>\n          <div class=\"manual-stock-form\" style=\"flex-direction:column;\">\n            <label style=\"font-size:11.5px; color:var(--text-muted);\">Avisar con cuántos días de margen antes de la devolución de una bobina</label>\n            <input type=\"number\" id=\"setBobinaDias\" min=\"0\" value=\"" + estado.settings.bobinaAvisoDias + "\">\n            <label style=\"font-size:11.5px; color:var(--text-muted); margin-top:6px;\">Considerar stock bajo con esta cantidad o menos</label>\n            <input type=\"number\" id=\"setStockUmbral\" min=\"0\" value=\"" + estado.settings.stockBajoUmbral + "\">\n            <label style=\"font-size:11.5px; color:var(--text-muted); margin-top:6px;\">Hora del día (0-23) a partir de la cual se hace la comprobación diaria</label>\n            <input type=\"number\" id=\"setAvisoHora\" min=\"0\" max=\"23\" value=\"" + estado.settings.avisoHora + "\">\n            <label style=\"font-size:11.5px; color:var(--text-muted); margin-top:6px;\">Correo al que quiero que me lleguen los avisos</label>\n            <input type=\"email\" id=\"setEmailDestino\" placeholder=\"tu@email.com\" value=\"" + estado.settings.emailDestino + "\">\n            <label style=\"display:flex; align-items:center; gap:6px; margin-top:8px; font-size:12.5px; color:var(--text-primary);\">\n              <input type=\"checkbox\" id=\"setSonidoEscaneo\" " + (estado.settings.sonidoEscaneo ? "checked" : "") + " style=\"width:16px; height:16px;\"> Pitido al escanear con éxito\n            </label>\n            <button class=\"btn primary\" id=\"saveSettingsBtn\" style=\"margin-top:8px;\">Guardar avisos</button>\n          </div>\n        </div>\n\n        <div class=\"panel\">\n          <p class=\"panel-title\">Ubicaciones</p>\n          <p style=\"font-size:11.5px; color:var(--text-faint); margin:0 0 8px 0;\">Lista para autocompletar — la ubicación sigue siendo texto libre, esto solo evita erratas.</p>\n          <div class=\"manual-stock-form\" style=\"margin-top:0;\">\n            <input type=\"text\" id=\"nuevaUbicacionInput\" placeholder=\"Nueva ubicación (ej. Pasillo 3 - B2)\">\n            <button class=\"cam-btn\" id=\"addUbicacionBtn\" style=\"flex:none;\">+ Añadir</button>\n          </div>\n          " + (estado.ubicaciones.length ? "\n          <div style=\"margin-top:10px; max-height:160px; overflow-y:auto;\">\n            " + estado.ubicaciones.map(_0x22784c => "\n              <div style=\"display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px dashed var(--border); font-size:12.5px;\">\n                <span>" + _0x1d1ab0(_0x22784c) + "</span>\n                <button class=\"btn-return\" data-ubicacion-del=\"" + _0x1d1ab0(_0x22784c) + "\" style=\"padding:4px 9px; font-size:10.5px; min-height:auto;\">Quitar</button>\n              </div>\n            ").join("") + "\n          </div>" : "<p style=\"font-size:11.5px; color:var(--text-faint); margin-top:8px;\">Todavía no hay ninguna en la lista.</p>") + "\n        </div>\n\n        <div class=\"panel\">\n          <p class=\"panel-title\">Lista rápida (Trabajo)</p>\n          <p style=\"font-size:11.5px; color:var(--text-faint); margin:0 0 8px 0;\">Materiales frecuentes para elegir de un vistazo junto al chat de cualquier orden o proyecto." + (supabaseCliente ? "" : " Se podrá configurar cuando se conecte Supabase (ver README).") + "</p>\n          <div class=\"manual-stock-form\" style=\"margin-top:0;" + (supabaseCliente ? "" : " display:none;") + "\">\n            <input type=\"text\" id=\"nuevoRapidoCodigo\" placeholder=\"Código (opcional)\">\n            <input type=\"text\" id=\"nuevoRapidoNombre\" placeholder=\"Nombre a mostrar\">\n            <button class=\"cam-btn\" id=\"addRapidoBtn\" style=\"flex:none;\">+ Añadir</button>\n          </div>\n          " + (estado.materialesRapidos.length ? "\n          <div style=\"margin-top:10px; max-height:160px; overflow-y:auto;\">\n            " + estado.materialesRapidos.map(_0x1f6978 => "\n              <div style=\"display:flex; justify-content:space-between; align-items:center; padding:5px 0; border-bottom:1px dashed var(--border); font-size:12.5px;\">\n                <span>" + _0x1d1ab0(_0x1f6978.nombre) + (_0x1f6978.codigo ? " <span style=\"color:var(--text-faint);\">(" + _0x1d1ab0(_0x1f6978.codigo) + ")</span>" : "") + "</span>\n                <button class=\"btn-return\" data-rapido-del=\"" + _0x1f6978.id + "\" style=\"padding:4px 9px; font-size:10.5px; min-height:auto;\">Quitar</button>\n              </div>\n            ").join("") + "\n          </div>" : "<p style=\"font-size:11.5px; color:var(--text-faint); margin-top:8px;\">Todavía no hay ningún material en la lista.</p>") + "\n        </div>\n\n        " + (hayBackend ? (() => {
        const _0x2d9f54 = estado.catalog.filter(_0xcd95ea => !_0xcd95ea.origenA3);
        return "\n          <div class=\"panel\">\n            <p class=\"panel-title\">Salud de datos frente a A3</p>\n            <div class=\"stat-row\"><span>Artículos confirmados en A3</span><span class=\"num\" style=\"color:var(--success);\">" + (estado.catalog.length - _0x2d9f54.length) + "</span></div>\n            <div class=\"stat-row\"><span>Dados de alta a mano, sin confirmar</span><span class=\"num\" style=\"color:" + (_0x2d9f54.length ? "var(--warning)" : "var(--success)") + ";\">" + _0x2d9f54.length + "</span></div>\n            " + (_0x2d9f54.length ? "\n            <p style=\"font-size:11.5px; color:var(--text-faint); margin:8px 0;\">Su código todavía no ha llegado desde A3 — puede ser un artículo nuevo pendiente de dar de alta allí, un código con una errata, o un duplicado.</p>\n            <div style=\"max-height:180px; overflow-y:auto;\">\n              " + _0x2d9f54.slice(0, 30).map(_0x395629 => "\n                <div style=\"padding:5px 0; border-bottom:1px dashed var(--border); font-size:12px;\">\n                  <span style=\"font-weight:700;\">" + _0x1d1ab0(_0x395629.code) + "</span> — " + _0x1d1ab0(_0x395629.desc) + "\n                </div>\n              ").join("") + "\n              " + (_0x2d9f54.length > 30 ? "<p style=\"font-size:11px; color:var(--text-faint); margin-top:6px;\">… y " + (_0x2d9f54.length - 30) + " más.</p>" : "") + "\n            </div>\n            " : "") + "\n          </div>";
      })() : "") + "\n\n        " + (estado.groups.montaje.length || estado.groups.proyecto.length ? "\n        <div class=\"panel\">\n          <p class=\"panel-title\">Histórico general</p>\n          " + (estado.groups.montaje.length ? "\n          <div class=\"stat-row\"><span>Órdenes de montaje</span><span class=\"num\">" + estado.groups.montaje.length + "</span></div>\n          <button class=\"btn\" id=\"exportAllMontajeBtn\">Exportar todas las órdenes</button>\n          " : "") + "\n          " + (estado.groups.proyecto.length ? "\n          <div class=\"stat-row\"><span>Proyectos creados</span><span class=\"num\">" + estado.groups.proyecto.length + "</span></div>\n          <button class=\"btn\" id=\"exportAllProyectoBtn\">Exportar todos los proyectos</button>\n          " : "") + "\n        </div>" : "") + "\n\n        <div class=\"panel\">\n          <p class=\"panel-title\">Actividad (últimos 30 días)</p>\n          " + _0x27a88a() + "\n        </div>\n        " : "") + "\n      ";
      $("#masOpcionesAlmacenBtn").addEventListener("click", () => {
        _0x39b15b = !_0x39b15b;
        render();
      });
      const _0x326d1b = $("#exportStockBtn");
      if (_0x326d1b) {
        _0x326d1b.addEventListener("click", _0x54b127);
      }
      const _0x5eb647 = $("#catalogFile");
      if (_0x5eb647) {
        _0x5eb647.addEventListener("change", _0x3238c1 => {
          if (_0x3238c1.target.files[0]) {
            _0xe4fd24(_0x3238c1.target.files[0]);
          }
        });
      }
      const _0x393efa = $("#overwriteCatalogFile");
      if (_0x393efa) {
        _0x393efa.addEventListener("change", _0x206d1a => {
          if (_0x206d1a.target.files[0]) {
            _0x344d6a(_0x206d1a.target.files[0]);
          }
          _0x206d1a.target.value = "";
        });
      }
      const _0x19a426 = $("#exportBackupBtn");
      if (_0x19a426) {
        _0x19a426.addEventListener("click", _0x4c08ae);
      }
      const _0x51b855 = $("#backupFile");
      if (_0x51b855) {
        _0x51b855.addEventListener("change", _0x41cbdc => {
          if (_0x41cbdc.target.files[0]) {
            _0x58a48a(_0x41cbdc.target.files[0]);
          }
        });
      }
      const _0x459f01 = $("#saveSettingsBtn");
      if (_0x459f01) {
        _0x459f01.addEventListener("click", () => {
          estado.settings.bobinaAvisoDias = Math.max(0, parseInt($("#setBobinaDias").value, 10) || 0);
          estado.settings.sonidoEscaneo = $("#setSonidoEscaneo").checked;
          estado.settings.stockBajoUmbral = Math.max(0, parseInt($("#setStockUmbral").value, 10) || 0);
          estado.settings.avisoHora = Math.min(23, Math.max(0, parseInt($("#setAvisoHora").value, 10) || 0));
          estado.settings.emailDestino = $("#setEmailDestino").value.trim();
          _0x37360d();
          _0x279f78("Configuración de avisos guardada.");
          render();
        });
      }
      const _0x2641d4 = $("#addUbicacionBtn");
      const _0x396f4e = $("#nuevaUbicacionInput");
      if (_0x2641d4) {
        _0x2641d4.addEventListener("click", () => {
          _0x1a6410(_0x396f4e.value);
          _0x396f4e.value = "";
        });
      }
      if (_0x396f4e) {
        _0x396f4e.addEventListener("keydown", _0x38a403 => {
          if (_0x38a403.key === "Enter") {
            _0x38a403.preventDefault();
            _0x1a6410(_0x396f4e.value);
            _0x396f4e.value = "";
          }
        });
      }
      _0x13ac6b.querySelectorAll("[data-ubicacion-del]").forEach(_0x16966b => {
        _0x16966b.addEventListener("click", () => _0x401198(_0x16966b.dataset.ubicacionDel));
      });
      const _0x1bbe33 = $("#addRapidoBtn");
      const _0x21438b = $("#nuevoRapidoCodigo");
      const _0xf70977 = $("#nuevoRapidoNombre");
      if (_0x1bbe33) {
        _0x1bbe33.addEventListener("click", () => {
          _0x1bf731(_0x21438b.value, _0xf70977.value);
          _0x21438b.value = "";
          _0xf70977.value = "";
        });
      }
      _0x13ac6b.querySelectorAll("[data-rapido-del]").forEach(_0x4ea113 => {
        _0x4ea113.addEventListener("click", () => _0x311314(_0x4ea113.dataset.rapidoDel));
      });
      const _0x200e4b = $("#catalogSearch");
      const _0x27a6f1 = _0x5cfc5(() => _0x1c3cca(), 220);
      if (_0x200e4b) {
        _0x200e4b.addEventListener("input", _0x44091e => {
          _0x1a8b0d = _0x44091e.target.value;
          _0x2ba7a9 = 80;
          _0x27a6f1();
        });
      }
      const _0x3214ef = $("#exportAllMontajeBtn");
      if (_0x3214ef) {
        _0x3214ef.addEventListener("click", () => _0x5c71d9("montaje"));
      }
      const _0x1364c6 = $("#exportAllProyectoBtn");
      if (_0x1364c6) {
        _0x1364c6.addEventListener("click", () => _0x5c71d9("proyecto"));
      }
      return;
    }
    if (estado.mode === "pedido") {
      const _0x120c96 = estado.pedidoItems.reduce((_0xebbf94, _0x492dd4) => _0xebbf94 + _0x492dd4.qty, 0);
      _0x13ac6b.innerHTML = "\n        <div class=\"panel\">\n          <p class=\"panel-title\">Resumen del pedido</p>\n          <div class=\"stat-row\"><span>Referencias</span><span class=\"num\">" + estado.pedidoItems.length + "</span></div>\n          <div class=\"stat-row\"><span>Unidades totales</span><span class=\"num\">" + _0x120c96 + "</span></div>\n        </div>\n        <div class=\"panel\">\n          <p class=\"panel-title\">Enviar</p>\n          <button class=\"btn primary\" id=\"sendPedidoBtn\" " + (estado.pedidoItems.length ? "" : "disabled title=\"Añade algún material antes de enviar\"") + ">Enviar pedido por correo</button>\n          <button class=\"btn ghost-danger\" id=\"clearPedidoBtn\">Vaciar pedido</button>\n          <p style=\"font-size:11.5px; color:var(--text-faint); margin-top:8px;\">" + (estado.settings.emailDestino ? "Se envía a " + estado.settings.emailDestino + "." : "Falta configurar el correo en Almacén → Avisos.") + "</p>\n        </div>\n      ";
      $("#sendPedidoBtn").addEventListener("click", _0x59a0b6);
      $("#clearPedidoBtn").addEventListener("click", _0x26d93b);
      return;
    }
    if (estado.mode === "mantenimiento") {
      const _0x1a1107 = _0x267a5a();
      if (!_0x1a1107) {
        _0x13ac6b.innerHTML = "";
        return;
      }
      const _0x219008 = _0x4f0ebd(_0x1a1107.id).map(_0x16e19b => ({
        ..._0x16e19b,
        calc: _0x22e6c7(_0x16e19b, _0x1a1107.kmActual || 0)
      })).filter(_0x105d61 => _0x105d61.calc.estado !== "ok").sort((_0x1f39b3, _0x41a71c) => _0x1f39b3.calc.urgencia - _0x41a71c.calc.urgencia).slice(0, 5);
      _0x13ac6b.innerHTML = "\n        <div class=\"panel\">\n          <p class=\"panel-title\">" + _0x1d1ab0(_0x1a1107.matricula) + "</p>\n          <div class=\"stat-row\"><span>Marca / modelo</span><span class=\"num\" style=\"font-size:12px;\">" + _0x1d1ab0(_0x1a1107.marca || "—") + " " + _0x1d1ab0(_0x1a1107.modelo || "") + "</span></div>\n          <div class=\"stat-row\"><span>Año</span><span class=\"num\">" + _0x1d1ab0(_0x1a1107.anio || "—") + "</span></div>\n          <div class=\"stat-row\"><span>Km actuales</span><span class=\"num\">" + (_0x1a1107.kmActual || 0).toLocaleString("es-ES") + "</span></div>\n        </div>\n        " + (_0x1a1107.mecanicoNombre || _0x1a1107.mecanicoContacto ? "\n        <div class=\"panel\">\n          <p class=\"panel-title\">Mecánico habitual</p>\n          " + (_0x1a1107.mecanicoNombre ? "<div class=\"stat-row\"><span>Nombre</span><span class=\"num\" style=\"font-size:12px;\">" + _0x1d1ab0(_0x1a1107.mecanicoNombre) + "</span></div>" : "") + "\n          " + (_0x1a1107.mecanicoContacto ? "<div class=\"stat-row\"><span>Contacto</span><span class=\"num\" style=\"font-size:12px;\">" + _0x1d1ab0(_0x1a1107.mecanicoContacto) + "</span></div>" : "") + "\n        </div>\n        " : "") + "\n        " + (_0x219008.length ? "\n        <div class=\"panel\">\n          <p class=\"panel-title\">Próximas revisiones</p>\n          " + _0x219008.map(_0x54aa01 => "<div class=\"stat-row\"><span>" + _0x1d1ab0(_0x54aa01.nombre) + "</span><span class=\"num\" style=\"color:" + (_0x54aa01.calc.estado === "atrasada" ? "var(--danger)" : "var(--warning)") + ";\">" + (_0x54aa01.calc.estado === "atrasada" ? "Atrasada" : "Pronto") + "</span></div>").join("") + "\n        </div>\n        " : "") + "\n      ";
      return;
    }
    if (estado.mode === "resumen") {
      _0x13ac6b.innerHTML = "";
      return;
    }
    const _0x3a7b10 = _0x1ea037();
    const _0xdc07e8 = _0x3a7b10 ? _0x3a7b10.servido.reduce((_0x3d7d96, _0x208052) => _0x3d7d96 + _0x208052.qty, 0) : 0;
    const _0x57870e = _0x3a7b10 ? _0x3a7b10.devuelto.reduce((_0x2ab2b7, _0xcd1410) => _0x2ab2b7 + _0xcd1410.qty, 0) : 0;
    const _0x5a7b39 = _0x453578 ? "\n      <div class=\"panel\" style=\"border-color:var(--accent);\">\n        <p class=\"panel-title\">Revisa antes de aplicar (" + _0x453578.plan.length + " líneas)</p>\n        <div style=\"max-height:260px; overflow-y:auto; margin-bottom:10px;\">\n          " + _0x453578.plan.map(_0x3d7c30 => {
      const _0x36151e = _0x3d7c30.kind === "ok" ? "se sirve entera" : _0x3d7c30.kind === "parcial" ? "solo hay " + _0x3d7c30.toServe + " de " + _0x3d7c30.requested : _0x3d7c30.kind === "sin-stock" ? "sin stock, no se sirve" : "no existe — se crea como plantilla";
      const _0x550752 = _0x3d7c30.kind === "ok" ? "var(--success)" : _0x3d7c30.kind === "nueva" || _0x3d7c30.kind === "sin-stock" ? "var(--danger)" : "var(--accent)";
      return "<div style=\"font-size:12px; padding:5px 0; border-bottom:1px dashed var(--border);\">\n              <strong>" + _0x1d1ab0(_0x3d7c30.code || "(sin código)") + "</strong> · " + _0x1d1ab0(_0x3d7c30.desc || "") + " · " + _0x3d7c30.requested + " uds\n              <div style=\"color:" + _0x550752 + ";\">" + _0x36151e + "</div>\n            </div>";
    }).join("") + "\n        </div>\n        <button class=\"btn primary\" id=\"applyOrderPlanBtn\">Confirmar y aplicar</button>\n        <button class=\"btn ghost-danger\" id=\"cancelOrderPlanBtn\">Cancelar</button>\n      </div>\n    " : "";
    _0x13ac6b.innerHTML = _0x5a7b39 + ("\n      <div class=\"panel\">\n        <p class=\"panel-title\">Resumen</p>\n        <div class=\"stat-row\"><span>Solicitud pendiente</span><span class=\"num\">" + (_0x3a7b10 ? _0x3a7b10.pendiente.items.reduce((_0x51442e, _0x376934) => _0x51442e + _0x376934.qty, 0) : 0) + " uds</span></div>\n        <div class=\"stat-row\"><span>Unidades servidas</span><span class=\"num\">" + _0xdc07e8 + "</span></div>\n        <div class=\"stat-row\"><span>Unidades devueltas</span><span class=\"num\">" + _0x57870e + "</span></div>\n        <div class=\"stat-row\"><span>Referencias en stock</span><span class=\"num\">" + estado.catalog.length + "</span></div>\n      </div>\n\n      <button class=\"cam-btn\" id=\"masOpcionesTrabajoLateralBtn\" style=\"width:100%;\">" + (_0x363017 ? "Ocultar herramientas de trabajo" : "Herramientas de trabajo") + "</button>\n\n      " + (_0x363017 ? "\n      <div class=\"panel\" style=\"margin-top:14px;\">\n        <p class=\"panel-title\">Exportar / Gestionar</p>\n        <button class=\"btn primary\" id=\"exportBtn\" " + (_0x3a7b10 ? "" : "disabled") + ">Exportar a Excel</button>\n        <button class=\"btn ghost-danger\" id=\"clearBtn\" " + (_0x3a7b10 ? "" : "disabled") + ">Vaciar esta lista</button>\n      </div>\n\n      <div class=\"panel\">\n        <p class=\"panel-title\">Crear " + (estado.mode === "montaje" ? "orden" : "líneas") + " desde archivo</p>\n        <label class=\"btn\" style=\"text-align:center; display:block; " + (_0x3a7b10 ? "" : "opacity:.5; pointer-events:none;") + "\">\n          Subir Excel / CSV / PDF\n          <input type=\"file\" id=\"orderFile\" accept=\".xlsx,.xls,.csv,.pdf\" style=\"display:none;\" " + (_0x3a7b10 ? "" : "disabled") + ">\n        </label>\n        <p style=\"font-size:11.5px; color:var(--text-faint); margin-top:6px;\">\n          Busca por código o referencia. El PDF es \"mejor esfuerzo\" — si falla, usa el Excel/CSV.\n        </p>\n      </div>\n\n      <div class=\"panel\">\n        <p class=\"panel-title\">Buscar en el stock</p>\n        <input type=\"text\" id=\"catalogSearch\" placeholder=\"Buscar por código o referencia…\" value=\"" + _0x1a8b0d + "\" style=\"width:100%; background:var(--bg-raised); border:1px solid var(--border); color:var(--text-primary); padding:9px 10px; border-radius:7px; font-size:13px;\">\n        <div id=\"catalogResults\" style=\"margin-top:8px; max-height:220px; overflow-y:auto;\"></div>\n      </div>\n\n      " + (estado.groups[estado.mode].length ? "\n      <div class=\"panel\">\n        <p class=\"panel-title\">Histórico general</p>\n        <div class=\"stat-row\"><span>" + (estado.mode === "montaje" ? "Órdenes creadas" : "Proyectos creados") + "</span><span class=\"num\">" + estado.groups[estado.mode].length + "</span></div>\n        <button class=\"btn\" id=\"exportAllBtn\">" + (estado.mode === "montaje" ? "Exportar todas las órdenes" : "Exportar todos los proyectos") + "</button>\n      </div>" : "") + "\n\n      " + (() => {
      const _0x5ce0ff = estado.deliveries.filter(_0xd487c3 => _0xd487c3.groupKind === estado.mode && _0xd487c3.groupName === estado.current[estado.mode]).slice(0, 8);
      if (!_0x5ce0ff.length) {
        return "";
      }
      return "\n        <div class=\"panel\">\n          <p class=\"panel-title\">Entregas firmadas (esta orden/proyecto)</p>\n          " + _0x5ce0ff.map(_0xe4bef7 => "\n            <div style=\"padding:8px 0; border-bottom:1px dashed var(--border); font-size:12px; display:flex; gap:8px; align-items:center;\">\n              <img src=\"" + _0xe4bef7.signature + "\" alt=\"firma\" style=\"width:52px; height:32px; object-fit:contain; background:#fff; border-radius:4px; border:1px solid var(--border);\">\n              <div style=\"flex:1;\">\n                <div>Pedido: " + _0x1d1ab0(_0xe4bef7.requesterName || "—") + " · Recogió: " + _0x1d1ab0(_0xe4bef7.recipientName || "—") + "</div>\n                <div style=\"color:var(--text-faint); font-size:11px;\">" + _0xe4bef7.ts + " · " + _0xe4bef7.items.length + " ref.</div>\n              </div>\n            </div>\n          ").join("") + "\n          <button class=\"btn\" id=\"exportDeliveriesBtn\" style=\"margin-top:8px;\">Exportar historial de entregas</button>\n        </div>";
    })() + "\n      " : "") + "\n    ");
    const _0x129374 = $("#masOpcionesTrabajoLateralBtn");
    if (_0x129374) {
      _0x129374.addEventListener("click", () => {
        _0x363017 = !_0x363017;
        render();
      });
    }
    const _0x5b4a35 = $("#exportBtn");
    if (_0x5b4a35) {
      _0x5b4a35.addEventListener("click", () => {
        const _0x2a1a5e = estado.current[estado.mode] || estado.mode;
        _0x55e21e(_0x3a7b10, "materiales_" + aSlug(_0x2a1a5e) + "_" + Date.now() + ".xlsx", _0x2a1a5e);
      });
    }
    const _0xe713b2 = $("#clearBtn");
    if (_0xe713b2) {
      _0xe713b2.addEventListener("click", _0x17cb6c);
    }
    const _0x535398 = $("#exportDeliveriesBtn");
    if (_0x535398) {
      _0x535398.addEventListener("click", _0x3131a5);
    }
    const _0xedb5dd = $("#orderFile");
    if (_0xedb5dd) {
      _0xedb5dd.addEventListener("change", _0x5eae90 => {
        if (_0x5eae90.target.files[0]) {
          _0x2f0af0(_0x5eae90.target.files[0]);
        }
        _0x5eae90.target.value = "";
      });
    }
    const _0x44058c = $("#applyOrderPlanBtn");
    if (_0x44058c) {
      _0x44058c.addEventListener("click", _0x1305ba);
    }
    const _0x37e43e = $("#cancelOrderPlanBtn");
    if (_0x37e43e) {
      _0x37e43e.addEventListener("click", _0x58f658);
    }
    const _0x32dcff = $("#catalogSearch");
    if (_0x32dcff) {
      const _0x17fd94 = _0x5cfc5(() => _0x42ddc6(), 220);
      _0x32dcff.addEventListener("input", _0x236369 => {
        _0x1a8b0d = _0x236369.target.value;
        _0x17fd94();
      });
    }
    _0x42ddc6();
    const _0x15168d = $("#exportAllBtn");
    if (_0x15168d) {
      _0x15168d.addEventListener("click", () => _0x5c71d9(estado.mode));
    }
  }
  function _0x42ddc6() {
    const _0x538deb = $("#catalogResults");
    if (!_0x538deb) {
      return;
    }
    const _0x397aba = _0x1a8b0d.trim().toLowerCase();
    if (!_0x397aba) {
      _0x538deb.innerHTML = "";
      return;
    }
    const _0x53bac6 = estado.catalog.filter(_0x143cab => _0x143cab.code.toLowerCase().includes(_0x397aba) || _0x143cab.desc.toLowerCase().includes(_0x397aba) || _0x143cab.referencia && _0x143cab.referencia.toLowerCase().includes(_0x397aba));
    if (!_0x53bac6.length) {
      _0x538deb.innerHTML = "<div style=\"color:var(--text-faint); font-size:12.5px;\">Sin coincidencias.</div>";
      return;
    }
    _0x538deb.innerHTML = _0x53bac6.slice(0, 25).map(_0x51d27a => "\n      <div style=\"display:flex; justify-content:space-between; gap:8px; padding:6px 0; border-bottom:1px dashed var(--border); font-size:12.5px;\">\n        <span class=\"row-code\" style=\"font-size:12px;\">" + _0x1d1ab0(_0x51d27a.code) + "</span>\n        <span style=\"color:var(--text-muted); text-align:right;\">" + _0x1d1ab0(_0x51d27a.desc) + " · Ubic: " + (_0x1d1ab0(_0x51d27a.location) || "sin ubicar") + " · <strong style=\"color:" + (_0x51d27a.qty > 0 ? "var(--success)" : "var(--danger)") + ";\">" + _0x51d27a.qty + "</strong></span>\n      </div>\n    ").join("") + (_0x53bac6.length > 25 ? "<div style=\"color:var(--text-faint); font-size:11.5px; padding-top:4px;\">+" + (_0x53bac6.length - 25) + " más…</div>" : "");
  }
})();
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js", {
      updateViaCache: "none"
    }).then(_0x4ef243 => {
      if (_0x4ef243.waiting) {
        showSwUpdateBanner(_0x4ef243);
      }
      _0x4ef243.addEventListener("updatefound", () => {
        const _0x60907f = _0x4ef243.installing;
        if (!_0x60907f) {
          return;
        }
        _0x60907f.addEventListener("statechange", () => {
          if (_0x60907f.state === "installed" && navigator.serviceWorker.controller) {
            showSwUpdateBanner(_0x4ef243);
          }
        });
      });
      _0x4ef243.update();
      setInterval(() => _0x4ef243.update(), 300000);
    }).catch(() => {});
    let _0x78d82d = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (_0x78d82d) {
        return;
      }
      _0x78d82d = true;
      if (window.__tecnomatActualizacionSolicitada) {
        window.location.reload();
      }
    });
  });
}
function showSwUpdateBanner(_0x4cef12) {
  if (document.getElementById("swUpdateBanner")) {
    return;
  }
  const _0xe34f02 = document.createElement("div");
  _0xe34f02.id = "swUpdateBanner";
  _0xe34f02.style.cssText = "position:fixed; left:0; right:0; bottom:0; z-index:9999; background:#14161C; color:#FFC800; padding:12px 16px; text-align:center; font-family:\"Rajdhani\",-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif; font-size:13.5px; box-shadow:0 -6px 20px rgba(0,0,0,0.25);";
  _0xe34f02.innerHTML = "Hay una versión nueva de la app disponible. <button id=\"swUpdateBtn\" style=\"background:#FFC800; color:#14161C; border:none; padding:7px 14px; border-radius:6px; font-weight:700; margin-left:8px; cursor:pointer;\">Actualizar ahora</button>";
  document.body.appendChild(_0xe34f02);
  document.getElementById("swUpdateBtn").addEventListener("click", () => {
    if (_0x4cef12.waiting) {
      if (!__actualizacionSegura()) {
        return;
      }
      window.__tecnomatActualizacionSolicitada = true;
      _0x4cef12.waiting.postMessage("SKIP_WAITING");
    }
    _0xe34f02.remove();
  });
}
