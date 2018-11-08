# Plant UML

===

## Sequence Diagram

@startuml
Alice -> Bob: Authentication Request
Bob --> Alice: Authentication Response

Alice -> Bob: Another authentication Request
Alice <-- Bob: Another authentication Response
@enduml

===

## Use Case Diagram

@startuml

(First usecase)
(Another usecase) as (UC2)  
usecase UC3
usecase (Last\nusecase) as UC4

@enduml

===

## Class Diagram

@startuml
Class01 <|-- Class02
Class03 *-- Class04
Class05 o-- Class06
Class07 .. Class08
Class09 -- Class10
@enduml

===

## Activity Diagram

@startuml

(*) --> "First Activity"
"First Activity" --> (*)

@enduml
