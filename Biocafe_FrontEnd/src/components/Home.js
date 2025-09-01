import React from "react";
import styles from "../styles/Home.module.css";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import HeaderMenu from "../components/HeaderMenu";

// Importar imágenes para el carrusel y contenido
import cafeHistoria from "../assets/images/cafe-historia.jpg";
import cafeColombia from "../assets/images/cafe-colombia.jpg";
import fertilizacionCafe from "../assets/images/fertilizacion-cafe.jpg";
import procesoCafe from "../assets/images/proceso-cafe.jpg";
import cafeGranos from "../assets/images/cafe-granos.jpg";

// Imágenes de los procesos del café
import procesoSiembra from "../assets/images/proceso-siembra.jpg";
import procesoCosecha from "../assets/images/proceso-cosecha.jpg";
import procesoSecado from "../assets/images/proceso-secado.jpg";
import procesoTostado from "../assets/images/proceso-tostado.jpg";
import procesoMolienda from "../assets/images/proceso-molienda.jpg";
import procesoPlagas from "../assets/images/proceso-plagas.jpg";

// Imágenes de caficultores
import caficultor1 from "../assets/images/caficultor1.jpg";
import caficultor2 from "../assets/images/caficultor2.jpg";
import caficultor3 from "../assets/images/caficultor3.jpg";

const Home = () => {
  // Configuración del carrusel
  const responsive = {
    superLargeDesktop: { breakpoint: { max: 4000, min: 1024 }, items: 1 },
    desktop: { breakpoint: { max: 1024, min: 768 }, items: 1 },
    tablet: { breakpoint: { max: 768, min: 464 }, items: 1 },
    mobile: { breakpoint: { max: 464, min: 0 }, items: 1 },
  };

  return (
    <div className={styles.homeContainer}>
      <HeaderMenu />

      {/* Carrusel */}
      <div className={styles.carouselContainer}>
        <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={4000}>
          <div className={styles.carouselItem}>
            <img className={styles.carouselImage} src={cafeHistoria} alt="Historia del Café" />
            <p>Descubre la historia del café y su impacto en la cultura mundial.</p>
          </div>
          <div className={styles.carouselItem}>
            <img className={styles.carouselImage} src={cafeColombia} alt="Cafés de Colombia" />
            <p>Los mejores cafés de Colombia y sus regiones cafetaleras.</p>
          </div>
          <div className={styles.carouselItem}>
            <img className={styles.carouselImage} src={fertilizacionCafe} alt="Fertilización del Café" />
            <p>Conoce los procesos de fertilización para un café de calidad.</p>
          </div>
          <div className={styles.carouselItem}>
            <img className={styles.carouselImage} src={procesoCafe} alt="Proceso del Café" />
            <p>Desde la semilla hasta la taza, el arte de producir café.</p>
          </div>
        </Carousel>
      </div>

      {/* Sección: ¿Qué es el Café? */}
      <div className={styles.section}>
        <img src={cafeGranos} alt="Granos de café" className={styles.sectionImage} />
        <div className={styles.sectionText}>
          <h2>¿Qué es el Café?🫘</h2>
          <p>
            El café es una de las bebidas más consumidas en el mundo, obtenida a partir de los granos 
            tostados de la planta de café. Su origen se remonta a Etiopía y se ha convertido en 
            un pilar fundamental en la cultura y la economía de muchos países.
          </p>
          <p>
            Existen dos variedades principales: <b>Arábica</b>, que es más suave y aromática, y 
            <b> Robusta</b>, que es más fuerte y con mayor contenido de cafeína.
          </p>
        </div>
      </div>

      {/* Sección: Procesos del café */}
      <h2 className={styles.processTitle}>¿Cuáles son los procesos del café?🧑‍🌾</h2>
      <div className={styles.processContainer}>
        <div className={styles.processCard}>
          <img src={procesoSiembra} alt="Siembra de café" />
          <h3>Siembra</h3>
          <p>Selección de semillas y siembra en viveros para un crecimiento óptimo.</p>
        </div>
        <div className={styles.processCard}>
          <img src={procesoCosecha} alt="Cosecha del café" />
          <h3>Cosecha</h3>
          <p>Recolección de los granos en su punto óptimo de maduración.</p>
        </div>
        <div className={styles.processCard}>
          <img src={procesoSecado} alt="Secado del café" />
          <h3>Secado</h3>
          <p>El café se seca al sol o en secadoras especiales.</p>
        </div>
        <div className={styles.processCard}>
          <img src={procesoTostado} alt="Tostado del café" />
          <h3>Tostado</h3>
          <p>Proceso de tostado que desarrolla los sabores y aromas.</p>
        </div>
        <div className={styles.processCard}>
          <img src={procesoMolienda} alt="Molienda del café" />
          <h3>Molienda</h3>
          <p>El café tostado se muele en diferentes tamaños según la preparación.</p>
        </div>
        <div className={styles.processCard}>
          <img src={procesoPlagas} alt="Control de plagas del café" />
          <h3>Control de Plagas</h3>
          <p>Prevención y control de insectos y enfermedades en la planta del café.</p>
        </div>
      </div>

      {/* Sección: Homenaje a los caficultores */}
      <div className={styles.caficultoresSection}>
        <h2 className={styles.messageTitle}>🌱 Homenaje a los Caficultores ☕</h2>
        <p className={styles.messageText}>
          Detrás de cada taza de café hay una historia de esfuerzo, dedicación y amor por la tierra.  
          Nuestros caficultores, con sus manos llenas de pasión, cultivan, cosechan y procesan  
          cada grano con un compromiso inquebrantable.  
          Este espacio es un reconocimiento a su arduo trabajo, porque sin ellos,  
          el aroma del café no llegaría a nuestros hogares.  
        </p>

        {/* Carrusel de caficultores */}
        <div className={styles.caficultoresCarousel}>
          <Carousel responsive={responsive} infinite autoPlay autoPlaySpeed={5000}>
            <div className={styles.caficultorItem}>
              <img src={caficultor1} alt="Caficultor cosechando café" />
            </div>
            <div className={styles.caficultorItem}>
              <img src={caficultor2} alt="Caficultora inspeccionando granos" />
            </div>
            <div className={styles.caficultorItem}>
              <img src={caficultor3} alt="Grupo de caficultores trabajando" />
            </div>
          </Carousel>
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>☕"Aquí te ayudamos a descubrir el mejor café. Porque cada grano cuenta." ☕</p>
      </footer>
    </div>
  );
};

export default Home;