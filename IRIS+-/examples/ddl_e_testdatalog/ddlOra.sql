create table schema(
oid number(38) primary key,
uri varchar(256)
)
partition by list(oid)
(
partition pschemanull values (null)
);

create table schemaheader(
oid number(38) primary key,
schemaoid number(38) not null,
version varchar(32),
priorversionschemaoid number(38),
backwardcompatibleschemaoid number(38),
incompatibleschemaoid number(38),
importsschemaoid number(38),
CONSTRAINT schemaheader_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(schemaheader_fk);

create table masterschema(
oid number(38) primary key,
schemaoid number(38)
);

create table class(
oid number(38) primary key,
name varchar(256),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT class_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(class_fk);

create table dataproperty(
oid number(38) primary key,
name varchar(256),
iskey char(1),
isnegative char(1),
isfunctional char(1),
typeclassoid number(38),
classoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT dataproperty_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(dataproperty_fk);

create table objectproperty(
oid number(38) primary key,
name varchar(256),
iskey char(1),
isnegative char(1),
isreflexive char(1),
isirreflexive char(1),
istransitive char(1),
issymmetric char(1),
isasymmetric char(1),
isfunctional char(1),
isinversefunctional char(1),
subjectclassoid number(38),
objectclassoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectproperty_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectproperty_fk);

create table datapropertyequivalent(
oid number(38) primary key,
propertyoid number(38),
eqpropertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertyequivalent_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertyequivalent_fk);

create table datapropertyannotated(
oid number(38) primary key,
propertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertyannotated_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertyannotated_fk);

create table datapropertysubproperty(
oid number(38) primary key,
propertyoid number(38),
subpropertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertysubproperty_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertysubproperty_fk);

create table datapropertydisjointwith(
oid number(38) primary key,
propertyoid number(38),
dispropertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38) references masterschema(oid),
CONSTRAINT datapropertydisjointwith_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertydisjointwith_fk);

create table datapropertydeprecated(
oid number(38) primary key,
propertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertydeprecated_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertydeprecated_fk);

create table classequivalent(
oid number(38) primary key,
classoid number(38),
eqclassoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT classequivalent_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(classequivalent_fk);

create table classsubclass(
oid number(38) primary key,
classoid number(38),
subclassoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT classsubclass_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(classsubclass_fk);

create table classcomplement(
oid number(38) primary key,
classoid number(38),
complementclassoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT classcomplement_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(classcomplement_fk);

create table classdisjointwith(
oid number(38) primary key,
classoid number(38),
disclassoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT classdisjointwith_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(classdisjointwith_fk);

create table classdeprecated(
oid number(38) primary key,
classoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT classdeprecated_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(classdeprecated_fk);

create table objectpropertyequivalent(
oid number(38) primary key,
propertyoid number(38),
eqpropertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertyequivalent_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertyequivalent_fk);

create table objectpropertydeprecated(
oid number(38) primary key,
propertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertydeprecated_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertydeprecated_fk);

create table objectpropertydisjointwith(
oid number(38) primary key,
propertyoid number(38),
dispropertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertydisjointwith_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertydisjointwith_fk);

create table objectpropertysubproperty(
oid number(38) primary key,
propertyoid number(38),
subpropertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertysubproperty_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertysubproperty_fk);

create table objectpropertyinverseof(
oid number(38) primary key,
propertyoid number(38),
inverseoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertyinverseof_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertyinverseof_fk);

create table collection(
oid number(38) primary key,
kind varchar(32),
classoid number(38),
schemaoid number(38),
masterschemaoid number(38)
)
partition by list(kind)
(
partition pcollnull values (null)
);

create table collectiondataelement(
oid number(38) primary key,
schemavalue varchar(256),
typeclassoid number(38),
collectionoid number(38) not null,
schemaoid number(38),
masterschemaoid number(38),
CONSTRAINT collectiondataelement_cfk FOREIGN KEY(collectionoid) references collection(oid)
)
partition by reference(collectiondataelement_cfk);

create table collectionclasselement(
oid number(38) primary key,
collectionoid number(38) not null,
classoid number(38),
schemaoid number(38),
masterschemaoid number(38),
CONSTRAINT collectionclasselement_cfk FOREIGN KEY(collectionoid) references collection(oid)
)
partition by reference(collectionclasselement_cfk);

create table oneof(
oid number(38) primary key,
classoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT oneof_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(oneof_fk);

create table oneofdataelement(
oid number(38) primary key,
value varchar(256),
typeclassoid number(38),
oneofoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT oneofdataelement_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(oneofdataelement_fk);

create table instance(
oid number(38) primary key,
name varchar(256),
masterschemaoid number(38)
);

create table i_class(
oid number(38) primary key,
URI varchar(256),
classoid number(38) not null,
instanceoid number(38),
CONSTRAINT i_class_fk FOREIGN KEY(classoid) references class(oid)
)
partition by reference(i_class_fk);

create table oneofi_classelement(
oid number(38) primary key,
oneofoid number(38),
i_classoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT oneofi_classelement_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(oneofi_classelement_fk);

create table chain(
oid number(38) primary key,
propertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT chain_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(chain_fk);

create table chainelement(
oid number(38) primary key,
chainoid number(38),
propertyoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT chainelement_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(chainelement_fk);

create table datapropertyhasvalue(
oid number(38) primary key,
value varchar(256),
propertyoid number(38),
restrictionoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertyhasvalue_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertyhasvalue_fk);

create table datapropertyallvaluesfrom(
oid number(38) primary key,
datarangeoid number(38),
propertyoid number(38),
restrictionoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertyallvaluesfrom_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertyallvaluesfrom_fk);

create table datapropertysomevaluesfrom(
oid number(38) primary key,
datarangeoid number(38),
propertyoid number(38),
restrictionoid number(38)references class(oid),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertysomevaluesfrom_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertysomevaluesfrom_fk);

create table objectpropertysomevaluesfrom(
oid number(38) primary key,
propertyoid number(38),
classoid number(38),
restrictionoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertysomevalsfrom_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertysomevalsfrom_fk);

create table objectpropertyallvaluesfrom(
oid number(38) primary key,
propertyoid number(38),
classoid number(38),
restrictionoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertyallvaluesfrom_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertyallvaluesfrom_fk);

create table objectpropertyhasself(
oid number(38) primary key,
propertyoid number(38),
restrictionoid number(38),
schemaoid number(38)  not null,
masterschemaoid number(38),
CONSTRAINT objectpropertyhasself_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertyhasself_fk);

create table objectpropertyhasvalue(
oid number(38) primary key,
propertyoid number(38),
i_classoid number(38),
restrictionoid number(38),
schemaoid number(38)not null,
masterschemaoid number(38),
CONSTRAINT objectpropertyhasvalue_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertyhasvalue_fk);

create table datapropertycardinality(
oid number(38) primary key,
value number(38),
ismin char(1),
isexact char(1),
propertyoid number(38),
restrictionoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT datapropertycardinality_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(datapropertycardinality_fk);

create table objectpropertycardinality(
oid number(38) primary key,
value number(38),
ismin char(1),
isexact char(1),
typeclassoid number(38),
propertyoid number(38),
classoid number(38),
restrictionoid number(38),
schemaoid number(38) not null,
masterschemaoid number(38),
CONSTRAINT objectpropertycardinality_fk FOREIGN KEY(schemaoid) references schema(oid)
)
partition by reference(objectpropertycardinality_fk);

create table i_dataproperty(
oid number(38) primary key,
value varchar(256),
i_classoid number(38),
propertyoid number(38) not null,
instanceoid number(38),
CONSTRAINT i_dataproperty_fk FOREIGN KEY(propertyoid) references dataproperty(oid)
)
partition by reference(i_dataproperty_fk);

create table i_objectproperty(
oid number(38) primary key,
subjecti_classoid number(38),
objecti_classoid number(38),
propertyoid number(38) not null,
instanceoid number(38),
CONSTRAINT i_objectproperty_fk FOREIGN KEY(propertyoid) references objectproperty(oid)
)
partition by reference(i_objectproperty_fk);
create index iobjprop_idx_object on i_objectproperty(objecti_classoid);


create table i_collection(
oid number(38) primary key,
collectionoid number(38) not null,
i_classoid number(38),
instanceoid number(38),
CONSTRAINT i_collection_fk FOREIGN KEY(collectionoid) references collection(oid)
)
partition by reference(i_collection_fk);

create table i_collectiondataelement(
oid number(38) primary key,
name varchar(256),
collectiondataelementoid number(38),
i_collectionoid number(38) not null,
instanceoid number(38),
CONSTRAINT i_collectiondataelement_fk FOREIGN KEY(i_collectionoid) references i_collection(oid)
)
partition by reference(i_collectiondataelement_fk);

create table i_collectionclasselement(
oid number(38) primary key,
name varchar(256),
collectionclasselementoid number(38),
i_collectionoid number(38) not null,
i_classoid number(38),
instanceoid number(38),
CONSTRAINT i_collectionclasselement_fk FOREIGN KEY(i_collectionoid) references i_collection(oid)
)
partition by reference(i_collectionclasselement_fk);

create table i_classalldifferent(
oid number(38) primary key,
instanceoid number(38)
)
partition by list(oid)
(
partition pi_classalldiffnull values (null)
);

create table i_classalldifferentmember(
oid number(38) primary key,
alldifferentoid number(38) not null,
i_classoid number(38),
instanceoid number(38),
CONSTRAINT i_classalldifferentmember_fk FOREIGN KEY(alldifferentoid) references i_classalldifferent(oid)
)
partition by reference(i_classalldifferentmember_fk);

create table i_classsameas(
oid number(38) primary key,
i_classoid number(38) not null,
asi_classoid number(38),
instanceoid number(38),
CONSTRAINT i_classsameas_fk FOREIGN KEY(i_classoid) references i_class(oid)
)
partition by reference(i_classsameas_fk);
