-- ========
-- Tables
-- ========
CREATE TABLE Submission (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_date DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- primary key not autoincrement cause we want to keep the proper order ID
CREATE TABLE Category (
    id INT PRIMARY KEY, 
    title_english Varchar(50) NOT NULL,
    title_spanish Varchar(50) NOT NULL,
    description_english Varchar(500) NOT NULL,
    description_spanish Varchar(500) NOT NULL
);

-- primary key not autoincrement so we ensure options match
CREATE TABLE QuestionInfo (
    id INT PRIMARY KEY,
    type ENUM('radio', 'checkbox', 'slider', 'text') NOT NULL,
    is_demographic BOOLEAN DEFAULT FALSE,
    category_id INT NULL,
    text_english VARCHAR(1000) NOT NULL,
    text_spanish VARCHAR(1000) NOT NULL,
    score_maximum INT NULL,
    min_slider_value INT NULL,
    max_slider_value INT NULL,
    min_slider_score INT NULL,
    max_slider_score INT NULL,
    slider_step_size INT NULL,
    FOREIGN KEY (category_id) REFERENCES Category(id)
);


CREATE TABLE QuestionOption (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT NOT NULL,
    label_english VARCHAR(250) NOT NULL,
    label_spanish VARCHAR(250) NOT NULL,
    weight INT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES QuestionInfo(id)
);


CREATE TABLE Answer (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    question_id INT NOT NULL,
    option_id INT NULL, 
    slider_value INT NULL,
    text_value VARCHAR(1000) NULL, 
    was_skipped BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (submission_id) REFERENCES Submission(id),
    FOREIGN KEY (question_id) REFERENCES QuestionInfo(id),
    FOREIGN KEY (option_id) REFERENCES QuestionOption(id)
);

CREATE TABLE CategoryScore (
    id INT AUTO_INCREMENT PRIMARY KEY,
    submission_id INT NOT NULL,
    category_id INT NOT NULL,
    score INT NOT NULL,
    FOREIGN KEY (submission_id) REFERENCES Submission(id),
    FOREIGN KEY (category_id) REFERENCES Category(id)
);


-- =========
-- Inserts
-- =========

--6 index categories
INSERT INTO Category (id, title_english, title_spanish, description_english, description_spanish)
VALUES 
(1, 'Materials and Material Sourcing', 'Materiales y Abastecimiento', 'Evaluates the origin and composition of materials used.', 'Evalúa el origen y composición de los materiales utilizados.'),
(2, 'Manufacturing Process', 'Proceso de Manufactura', 'Evaluates efficiency and impact of the manufacturing process.', 'Evalúa la eficiencia y el impacto del proceso de manufactura.'),
(3, 'Energy Use and Waste', 'Uso de la Energía y Residuos', 'Evaluates waste and energy management.', 'Evalúa la gestión de residuos y energía.'),
(4, 'Distribution and Packaging', 'Distribución y Empaque', 'Evaluates transportation, packaging, and logistics.', 'Evalúa transporte, empaque y logística del producto.'),
(5, 'Product Lifetime', 'Vida Útil del Producto', 'Evaluates durability and expected lifetime.' , 'Evalúa la durabilidad y vida útil esperada.'),
(6, 'Product End-of-Life', 'Fin de Vida del Producto', 'Evaluates product recyclability and end-of-life planning.', 'Evalúa reciclabilidad y disposición final del producto.')

--Demographic questions
INSERT INTO QuestionInfo (id, type, is_demographic, text_english, text_spanish)
VALUES 
(1, 'text', 1, 'What is the name of your product?', '¿Cual es el nombre de su producto?'),
(2, 'radio', 1, 'What is the size of your company?', '¿Cuál es el tamaño de su empresa?'),
(3, 'checkbox', 1, 'What province is your company located (select multiple if your company has multiple locations)?', '¿En qué provincia está ubicada su empresa (seleccione varias si su empresa tiene varias ubicaciones)?'),
(4, 'text', 1, 'What sector is your product in (please reference CIIU numbering chart: https://www.hacienda.go.cr/docs/CorrespondenciaATVCIIU3-TRIBUCRCIIU4-Completo.pdf)', '¿A qué sector pertenece su empresa (por favor consulta la tabla de numeración de CIIU: https://www.hacienda.go.cr/docs/CorrespondenciaATVCIIU3-TRIBUCRCIIU4-Completo.pdf)?'),
(5, 'radio', 1, 'Does your company have a sustainability strategy that is integrated into your overall business strategy?', '¿Tiene su empresa una estrategia de sostenibilidad integrada en su estrategia de negocio?'),
(6, 'text', 1, 'List all certifications or recognitions your company has. For example, ISO 9001, ISO 14001, ISO 14064/INTE B5, or PBAE (Bandera Azul Ecológica). Write none if your company has none, you do not know, or if the question is not applicable.', 'Enumere todas las certificaciones o reconocimientos que tiene su empresa. Por ejemplo, ISO 9001, ISO 14001, ISO 14064/INTE B5, o PBAE (Bandera Azul Ecológica). Escriba Ninguno si su empresa no tiene ninguno, usted no sabe, o si la pregunta no es aplicable.')

--Demographic options
INSERT INTO QuestionOption (question_id, label_english, label_spanish, weight)
VALUES
(2, 'Micro (1-5 employees)', 'Micro (1-5 empleados)', 0),
(2, 'Small (6-30 employees)', 'Pequeño (6-30 empleados)', 0),
(2, 'Medium (31-120 employees)', 'Mediano (31-100 empleados)', 0),
(2, 'Large (121+ employees)', 'Grande(101+ empleados)', 0),

(3, 'Alajuela', 'Alajuela', 0),
(3, 'Cartago', 'Cartago', 0),
(3, 'Guanacaste', 'Guanacaste', 0),
(3, 'Heredia', 'Heredia', 0),
(3, 'Limón', 'Limón', 0),
(3, 'Puntarenas', 'Puntarenas', 0),
(3, 'San José', 'San José', 0),

(5, 'Yes', 'Sí', 0),
(5, 'No', 'No', 0)


--Survey questions (radio)
INSERT INTO QuestionInfo (id, type, category_id, text_english, text_spanish)
VALUES 
(9, 'radio', 1, 'Does your product rely on scarce materials?', '¿Su producto depende de materiales escasos?'),
(10, 'radio', 1, 'What percentage of raw material is turned into product?', '¿Qué porcentaje de las materias primas se procesa para convertirse en producto final?'),
(11, 'radio', 1, 'How many of your material suppliers have any sustainability certifications (ISO/INTECO, Bandera Azul Ecológica, etc.)?', '¿Cuántos de sus proveedores de materiales cuentan con alguna certificación de sostenibilidad (ISO/INTECO, Bandera Azul Ecológica, etc.)?'),

(14, 'radio', 2, 'How often must your equipment be cleaned?', 'Con qué frecuencia debe limpiarse su equipo?'),

(20, 'radio', 3, 'Over the past 5 years has energy or electricity consumption to manufacture this product gone down?', '"En los últimos 5 años, ¿ha disminuido el consumo de energía o electricidad para fabricar este producto?'),
(21, 'radio', 3, 'Over the past 5 years has water consumption to manufacture this product gone down?', 'En los últimos 5 años, ¿ha disminuido el consumo de agua para fabricar este producto?'),
(22, 'radio', 3, 'If you generate your own water and energy, is it from renewable sources (eg. rainwater, wind turbines)?', 'Si genera su propia agua y energía, ¿provienen de fuentes renovables (ej. agua de lluvia, turbinas eólicas)?'),
(24, 'radio', 3, 'If you release any greenhouse gases/pollutants, do you have a process for limiting it?', 'Si libera gases o contaminantes de efecto invernadero, ¿tiene algún proceso para limitarlos?'),
(25, 'radio', 3, 'Is there hazardous waste created during the manufacturing process?', '¿Se genera algún residuo peligroso durante el proceso de manufactura?'),
(26, 'radio', 3, 'If hazardous waste is created, do you properly dispose of it (eg. sent to a disposal factory)?', 'Si se generan residuos peligrosos, ¿los eliminas correctamente (ej. los envías a una fábrica de trituradores)?'),

(27, 'radio', 4, 'Does your product require multiple factory sites to create?', '¿Su producto requiere de múltiples plantas o fábrica para su creación o emsamblaje?'),
(30, 'radio', 4, 'How long does it take for the majority of products to reach clients within Costa Rica, approximately?', '¿Cuánto tiempo tarda aproximadamente la mayoría de los productos en llegar a los clientes dentro de Costa Rica?'),

(33, 'radio', 5, 'Are your products stored in a way that prevents risks or environmental impacts? ', '¿Sus productos se almacenan de forma que se eviten riesgos o impactos ambientales?'),
(34, 'radio', 5, 'Does your product release any hazardous material during its lifetime?', '¿Su producto libera algún material peligroso durante su vida útil?'),
(35, 'radio', 5, 'Can your product be repaired or upgraded during its lifetime?', '¿Su producto puede ser reparado o actualizado durante su vida útil?'),
(36, 'radio', 5, 'How many years is your product designed to last?', '¿Su producto está diseñado para durar?'),

(38, 'radio', 6, 'Does your product need to be disassembled to dispose of properly?', '¿Es necesario desmontar su producto para desecharlo correctamente?'),
(40, 'radio', 6, 'If your product is not biodegradable, compostable, or recyclable on its own do you recollect them from customers to dispose of properly? ', 'Si su producto no es biodegradable, compostable o reciclable por sí solo, ¿los recoge de los clientes para desecharlos adecuadamente?'),
(41, 'radio', 6, 'Does your product release any hazardous material or emissions if it fails?', '¿Su producto genera o libera algún material peligroso o emisiones si falla?'),
(42, 'radio', 6, 'How many times can your product be reused or recycled? If your product is a consumable, select not applicable.', '¿Cuántas veces se puede reutilizar o reciclar su producto? Si su producto es un consumible, seleccione no aplicable.'),
(43, 'radio', 6, 'If your product is a consumable, do you minimize client waste (eg. offer bulk sizing options to reduce per-unit disposal)?', 'Si su producto es un consumible, ¿minimiza el desperdicio del cliente (ej. ofrece opciones de tamaño a granel para reducir la eliminación por unidad)?')

--Survey questions (checkbox)
INSERT INTO QuestionInfo (id, type, category_id, text_english, text_spanish, score_maximum)
VALUES 
(7, 'checkbox', 1, 'Where do the materials that make your product come from?', '¿De dónde provienen los materiales que componen su producto?', NULL),
(8, 'checkbox', 1, 'What are your product materials derived from?', '¿De qué materiales se derivan sus productos?', NULL),

(13, 'checkbox', 2, 'How is your equipment cleaned?', 'Su equipo debe limpiarse?', NULL),
(15, 'checkbox', 2, 'Does your product require any of the following procedures for employees during manufacturing?', '¿Su producto requiere alguno de los siguientes procedimientos para los empleados durante su fabricación?', NULL),
(16, 'checkbox', 2, 'Do you use renewable resources to help  manufacturing?', '¿Utiliza recursos renovables para ayudar a la fabricación?', 10),

(17, 'checkbox', 3, 'Does your company do any of the following related to water?', '¿Su empresa realiza alguna de las siguientes acciones relacionadas con el agua?', 10),
(18, 'checkbox', 3, 'Does your company do any of the following related to energy?', '¿Su empresa realiza alguna de las siguientes acciones relacionadas con la energía?', 10),
(19, 'checkbox', 3, 'Does your company do any of the following related to materials?', '¿Su empresa realiza alguna de las siguientes acciones relacionadas con materiales?', 10),
(23, 'checkbox', 3, 'What air pollutants/greenhouse gases are released as part of your manufacturing process?', 'Cuáles contaminantes del aire/gases de efecto invernadero se liberan como parte de su proceso de manufactura?', NULL),

(28, 'checkbox', 4, 'What kind of vehicles does your company use to transport the product', '¿Qué tipo de vehículos utiliza su empresa para transportar el producto?', NULL),
(31, 'checkbox', 4, 'What is the primary origin of the product packaging?', '¿Cuál es el origen principal del empaque del producto?', NULL),
(32, 'checkbox', 4, 'Is your product packaging all or partially:', '¿El embalaje de su producto es total o parcialmente:', NULL),

(37, 'checkbox', 5, 'During its lifetime, which of the following ongoing inputs or maintenance requirements does your product need?', 'Durante su vida útil, ¿cuál de los siguientes insumos o requisitos de mantenimiento continuos necesita vuestro producto?', NULL),

(39, 'checkbox', 6, 'When your product is disposed of, it is:', 'Cuando se desecha su producto, se hace lo siguiente:', NULL)

--Survey questions (slider)
INSERT INTO QuestionInfo (id, type, category_id, text_english, text_spanish, min_slider_value, max_slider_value, min_slider_score, max_slider_score, slider_step_size)
VALUES 
(12, 'slider', 2, 'What percentage of your manufactured products are defective?', '¿Qué porcentaje de sus productos fabricados son defectuosos?', 0, 100, 10, 0, 10),

(29, 'slider', 4, 'What percentage of your products produced are exported outside of Costa Rica?', '¿Qué porcentaje de sus productos producidos se exportan fuera de Costa Rica?', 0, 100, 10, 0, 10)

--Options for non slider questions
INSERT INTO QuestionOption (question_id, label_english, label_spanish, weight)
VALUES
(7, 'Costa Rica', 'Costa Rica', 10),
(7, 'Countries Within North, Central, or South America', 'Países de Centroamérica y América', 5),
(7, 'Countries in Asia', 'Países de Asia', 0),
(7, 'Other countries', 'Otros países', 0),

(8, 'Recycled/reclaimed materials (eg. recycled aluminum)', 'Materiales reciclados/recuperados (por ejemplo, aluminio reciclado)', 10),
(8, 'Renewable/bio-based materials (eg. wood)', 'Materiales renovables/de origen biológico (por ejemplo, madera)', 10),
(8, 'Virgin mineral or metal materials (eg. newly mined iron)', 'Materiales minerales o metálicos vírgenes (por ejemplo, hierro recién extraído)', 5),
(8, 'Virgin fossil based synthetic matierals (eg. plastic, nylon)', 'Materiales sintéticos basados ​​en fósiles vírgenes (por ejemplo, plástico, nailon)', 0),

(9, 'Yes, all of the materials are scarce', 'Si, todos los materiales son escasos', 0),
(9, 'Yes, most of the materials are scarce', 'Sí, la mayoría de los materiales son escasos', 2),
(9, 'Yes, but only some of the materials are scarce', 'Sí, pero sólo algunos de los materiales son escasos', 4),
(9, 'Yes, but almost none of the materials are scarce', 'Sí, pero casi ninguno de los materiales escasea', 6),
(9, 'No, all materials are abundant', 'No, todos los materiales son abundantes', 10),

(10, '100%', '100%', 10),
(10, '90-99%', '90-99%', 9),
(10, '75-89%', '75-89%', 7),
(10, '50-75%', '50-75%', 5),
(10, 'Less than 50%', 'Menos de 50%', 0),

(11, 'All of them', 'Todos', 10),
(11, 'Most of them', 'La mayoría', 8),
(11, 'Half of them', 'La mitad', 5),
(11, 'Some of them', 'Algunos', 3),
(11, 'None of them', 'Ninguno', 0),

(13, 'With non-consumable materials (ex: a brush)', 'Con materiales no consumibles (ej: un pincel)', 10),
(13, 'With water', 'Con agua', 7),
(13, 'Using enviromentally safe chemicals', 'Uso de productos químicos respetuosos con el medio ambiente', 6),
(13, 'Using chemicals', 'Usos de químicos', 3),
(13, 'A more intensive method', 'Un método más intensivo', 0),

(14, 'Multiple times per day', 'Varias veces al día', 0),
(14, 'Once a day', 'Una vez al días', 1),
(14, 'Several times per week', 'Algunas veces por semana', 2),
(14, 'Once per week', 'Una vez por semana', 3),
(14, 'Once per month', 'Una vez al mes', 4),
(14, 'Every 3–4 months', 'Cada 3 o 4 meses', 6),
(14, 'Once per year', 'Una vez al año', 8),
(14, 'Once every 2+ years', 'Una vez cada 2+ años', 10),

(15, 'Extra safety protocol for equipment use', 'Protocolo de seguridad adicional para el uso del equipo', 8),
(15, 'Decontamination of materials or employees', 'Desconnominación de materiales o empleados', 5),
(15, 'Minor protective equipment (eg. Masks or gloves)', 'Equipo de protección menor (ej. mascarillas o guantes)', 5),
(15, 'Major protective equipment (eg. hazard suits)', 'Equipo de protección principal (ej. trajes de protección)', 0),
(15, 'None', 'Ninguno', 10),

(16, 'Sunlight', 'Luz día/luz solar', 2),
(16, 'Rainwater', 'Agua de lluvia', 2),
(16, 'Hydropower', 'Energía Hídrica', 2),
(16, 'Windpower', 'Energía Eólica', 2),
(16, 'Natural ventilation', 'Ventilación natural', 2),
(16, 'Other', 'Otro', 2),
(16, 'None', 'Ninguno', 0),

(17, 'Conduct regular water audits (1–2 years)', 'Realiza auditorías de agua regularmente (1-2 años)', 2),
(17, 'Track water usage per unit of product', 'Monitorea el uso de agua por unidad de producto', 2),
(17, 'Treat wastewater before disposal (onsite or through a 3rd party company)', 'Trata el agua residual antes de su disposición (en sitio o mediante un tercero)', 2),
(17, 'Actively work to lower wastewater during manufacturing', 'Trabaja activamente para reducir aguas residuales durante el proceso de manufactura', 2),
(17, 'Measure water quality regularly', 'Mide la calidad del agua regularmente', 2),
(17, 'Recycle waste water', 'Recicla  o reutiliza aguas residuales', 2),

(18, 'Conduct regular energy audits (3–5 years)', 'Realiza auditorías energéticas regularmente (3-5 años)', 2),
(18, 'Track energy usage per unit of product', 'Monitorea el uso de energía por unidad de producto', 2),
(18, 'Actively work to lower energy usage during manufacturing', 'Trabaja activamente para reducir el uso de energía durante el proceso de manufactura', 2),
(18, 'Generate renewable energy for self-consumption', 'Genera energía renovable para autoconsumo', 2),
(18, 'Reuse energy (eg. use rechargeable batteries, use heat emissions as energy)', 'Reutiliza energía (ej. usa baterías recargables, usa emisiones de calor como energía)', 2),

(19, 'Track the amount of material waste per product', 'Monitorea la cantidad de residuos generados por producto', 2),
(19, 'Collect and recycle waste material for every or most stages of product creation', 'Recolectar y reciclar material de desecho para todas o la mayoría de las etapas de creación del producto.', 2),
(19, 'Recycle or repurpose all or most defective products', 'Reciclar o reutilizar todos o la mayoría de los productos defectuosos', 2),
(19, 'Recycle manufacturing waste (by yourself or with another company)', 'Reciclar residuos de fabricación (por sí mismo o con otra empresa)', 2),
(19, 'Design products or manufacturing processes to minimize material waste', 'Diseñar productos o procesos de fabricación para minimizar el desperdicio de material', 2),

(20, 'Yes', 'Sí', 10),
(20, 'No', 'No', 0),

(21, 'Yes', 'Sí', 10),
(21, 'No', 'No', 0),

(22, 'Yes', 'Sí', 10),
(22, 'No', 'No', 0),

(23, 'Not measured', 'No se cuantifican', 0),
(23, 'None', 'Ninguno', 10),
(23, 'Carbon Dioxide', 'Dióxido de carbono', 1),
(23, 'Nitrous Oxide', 'Óxido nitroso', 1),
(23, 'Methane', 'Metano', 1),
(23, 'Fluorine containing gases', 'Gases que contienen flúor', 1),
(23, 'Other high global warming potential refrigerants or chemical fumes', 'Refrigerantes o compuestos químicos de alto potencial de calentamiento global', 1),
(23, 'Other', 'Otros', 2),

(24, 'Yes', 'Sí', 10),
(24, 'No', 'No', 0),

(25, 'Yes', 'Sí', 0),
(25, 'No', 'No', 10),

(26, 'Yes', 'Sí', 10),
(26, 'No', 'No', 0),

(27, 'Yes', 'Sí', 0),
(27, 'No', 'No', 10),

(28, 'Electric vehicles', 'Vehículos eléctricos', 10),
(28, 'Hybrid vehicles (electric)', 'Vehiculos híbridos (eléctrico)', 8),
(28, 'Hybrid vehicles (gasoline)', 'Vehiculos híbridos (gasolina)', 6),
(28, 'Gas vehicles', 'Vehículos de gasolina', 2),
(28, 'Diesel Vechicles', 'Vehículos de deisel', 0),

(30, '1-4 hours', '1-4 horas', 10),
(30, 'One day', 'Un día', 8),
(30, 'Half a Week', 'Media semana', 5),
(30, 'One week', 'Una semana', 3),
(30, 'Longer than a week', 'Más de una semana', 0),

(31, 'Created in the same factory as the product', 'Creado en la misma fábrica que el producto.', 10),
(31, 'Costa Rica', 'Costa Rica', 10),
(31, 'Countries Within Central America and America', 'Países  de Centroamérica y América', 5),
(31, 'Countries in Asia', 'Países de Asia', 0),
(31, 'Other countries', 'Otros países', 0),

(32, 'Recyclable', 'Reciclable', 10),
(32, 'Biodegradable or compostable', 'Biodegradable o compostable', 10),
(32, 'Reusable/returnable', 'Reutilizable/retornable', 10),
(32, 'Must be disposed of in the garbage', 'Debe desecharse en la basura.', 0),

(33, 'Yes', 'Sí', 10),
(33, 'No', 'No', 0),

(34, 'Yes', 'Sí', 0),
(34, 'No', 'No', 10),

(35, 'Yes', 'Sí', 10),
(35, 'No', 'No', 0),

(36, '0-11 months', '0-11 meses', 2),
(36, '1-5 years', '1-5 años', 5),
(36, '6-10 years', '6-10 años', 8),
(36, '11+ years', '11+ años', 10),

(37, 'Constant energy input', 'Entrada constante de energía', 0),
(37, 'Periodic energy input (eg. chargable)', 'Entrada periódica de energía (ej. cargable)', 5),
(37, 'Regular cleaning or maintance (eg. adding lubricants, detegants)', 'Limpieza o mantenimiento regular (ej. añadir lubricantes, detegantas)', 3),
(37, 'Temperature control (eg. refrigeration)', 'Control de temperatura (ej. refrigeración)', 2),
(37, 'Replacement Consumables (eg. filters, batteries)', 'Consumibles de repuesto (ej. filtros, baterías)', 0),
(37, 'Other methods that require extra materials', 'Otros métodos que requieren materiales adicionales', 2),
(37, 'None', 'Ninguno', 10),

(38, 'No', 'No', 10),
(38, 'Yes, and can be done easily', 'Sí, y se puede hacer fácilmente', 5),
(38, 'Yes, but cannot be done easily (requires special equipment)', 'Sí, pero no se puede hacer fácilmente (requiere equipo especial)', 0),

(39, 'Fully Recyclable', 'Totalmente Reciclable', 10),
(39, 'Fully Compostable', 'Totalmente Compostable', 10),
(39, 'Fully Biodegradable', 'Totalmente Biodegradable', 10),
(39, 'Fully Co-processable (in cement kilns)', 'Totalmente coprocesable (en hornos cementeros)', 2),
(39, 'Partially  Recyclable', 'Parcialmente Reciclable', 5),
(39, 'Partially  Compostable', 'Parcialmente Compostable', 5),
(39, 'Partially  Biodegradable', 'Parcialmente Biodegradable', 5),
(39, 'Partially Co-processable (in cement kilns)', 'Parcialmente coprocesable (en hornos cementeros)', 1),
(39, 'Requires other special treatment', 'Requiere otro tratamiento especial', 1),
(39, 'Must go to landfill', 'Debe ir al relleno sanitario', 0),

(40, 'Yes', 'Sí', 10),
(40, 'No, contact information is given for another company to do it', 'No, se facilita información de contacto para que otra empresa lo haga.', 7),
(40, 'No', 'No', 0),

(41, 'Yes', 'Sí', 0),
(41, 'No', 'No', 10),

(42, '0', '0', 0),
(42, '1-5', '1-5', 5),
(42, '6-30', '6-30', 7),
(42, 'Infinitely', 'Infinitamente', 10),

(43, 'Yes', 'Sí', 10),
(43, 'No', 'No', 0)






		
