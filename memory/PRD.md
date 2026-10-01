# PRD — Jewel Sort Puzzle

## Problema y objetivo
Crear una experiencia móvil Expo vertical de clasificación de gemas, completamente jugable en Android/iOS, con identidad visual propia, diez niveles manuales resolubles y progreso local sin cuentas ni servicios online.

## Arquitectura
- **Frontend:** Expo Router + React Native, una pantalla raíz con selección de niveles y tablero de juego.
- **Lógica:** `frontend/src/game/logic.ts` contiene capacidad de tubos, movimientos válidos, clonación, estados completos y victoria.
- **Niveles:** `frontend/src/game/levels.ts` contiene diez tableros deterministas progresivos; cada color aparece cuatro veces y cada nivel tiene dos tubos libres.
- **Interfaz:** `app/index.tsx`, `components/Tube.tsx`, `components/Gem.tsx` y `components/LevelCard.tsx`; estilos basados en tokens de `src/theme.ts`.
- **Persistencia:** `src/storage/progress.ts` usa AsyncStorage para niveles completados y mejores movimientos.
- **Animación y feedback:** Reanimated para elevación de la gema, LayoutAnimation para recolocación y Expo Haptics para selección, error y victoria.

## Personas
- Jugador móvil que quiere partidas cortas de lógica sin conexión.
- Jugador que busca progresión clara y retos manuales, no tableros aleatorios.

## Requisitos principales (estáticos)
1. Capacidad de cuatro gemas por tubo.
2. Selección por toque de la gema superior con elevación visual.
3. Movimiento válido a tubo vacío o sobre el mismo color.
4. Movimiento inválido con feedback y limpieza de selección.
5. Victoria cuando todos los tubos están completos o vacíos.
6. Reinicio, deshacer, contador de movimientos y guardado local.
7. Diez niveles manuales y dificultad progresiva.
8. Diseño vertical, oscuro, táctil y seguro para Android.

## Implementado — 2026-10-01
- Construida la selección de diez niveles con bloqueo progresivo, récord de movimientos y estados completados.
- Construido el tablero táctil con gemas con gradientes, brillos, iconografía, tubos translúcidos, haptics y animaciones.
- Implementados movimientos, validación, selección, invalidación, deshacer, reinicio, contador y modal de victoria con siguiente nivel.
- Implementado AsyncStorage para progreso y mejores resultados.
- Verificados lint, TypeScript, render móvil, movimiento válido, movimiento inválido, deshacer, reinicio, resolución completa del nivel 1 y persistencia de progreso.

## Actualización visual gemas 3D — 2026-10-01
- Rediseño de `src/components/Gem.tsx` con cuerpo redondo, gradiente diagonal highlight → base → shadow y sombra interior inferior para dar volumen.
- Faceta superior (elipse clara), glint especular y micro-glint secundario para simular cristal pulido.
- Entrada con spring + burst de destello (anillo + cruz) al aterrizar la gema en un tubo.
- Al seleccionar: elevación por spring + loop de flotación suave + glow pulsante exterior del color de la gema.
- Paleta de colores, mecánica, niveles, undo, reset y persistencia **no modificados**.

## Backlog priorizado
### P0 — Pendiente antes de ampliar el juego
- Ninguno para el alcance actual.

### P1 — Próximas mejoras de producto
- Añadir sonidos opcionales y control de volumen.
- Añadir partículas de victoria y transición entre niveles.
- Añadir más niveles manuales con métricas de dificultad.

### P2 — Mejoras futuras
- Estadísticas de sesión y récords globales locales.
- Temas visuales desbloqueables.
- Tutorial interactivo para el primer nivel.

## Próximas tareas
1. Recoger feedback de jugadores sobre dificultad de niveles 5–10.
2. Ajustar par de movimientos según partidas reales.
3. Añadir pruebas automatizadas de los diez caminos de resolución.