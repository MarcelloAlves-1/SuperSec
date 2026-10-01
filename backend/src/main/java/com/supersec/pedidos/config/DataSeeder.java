package com.supersec.pedidos.config;

import com.supersec.pedidos.model.Product;
import com.supersec.pedidos.model.Role;
import com.supersec.pedidos.model.User;
import com.supersec.pedidos.repository.ProductRepository;
import com.supersec.pedidos.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.math.BigDecimal;
import java.util.List;

@Configuration
public class DataSeeder {
 @Bean CommandLineRunner seed(UserRepository users, ProductRepository products, PasswordEncoder encoder){
  return args -> {
   if(!users.existsByEmail("admin@supersec.com.br")) users.save(new User("Administrador SuperSec","admin@supersec.com.br",encoder.encode("SuperSec123"),Role.ADMIN));
   List<ProductSeed> catalog = List.of(
    new ProductSeed("Rodo Grande Alumínio 60 cm","Rodo grande com base de alumínio e cabo longo para pisos e áreas maiores.","57.90",20,"https://armazemcoral.agilecdn.com.br/789615.jpg?v=26-1850257242"),
    new ProductSeed("Rodo de Pia EsfreBom","Rodo compacto para pia, bancada e superfícies pequenas.","18.40",30,"https://compensamateriais.fbitsstatic.net/img/p/kit-pia-esfrebom-com-rodo-ralo-suporte-para-esponja-e-esponja-esfrebom-diamond-bettanin-70629/257148.jpg?h=640&qs=ignore&v=no-change&w=640"),
    new ProductSeed("Detergente Ypê Neutro 500 ml","Detergente líquido neutro para louças e limpeza diária.","3.49",80,"https://www.paodeacucar.com/img/uploads/1/8/529008.jpg"),
    new ProductSeed("Desinfetante Ypê Bak Eucalipto 500 ml","Desinfetante para limpeza geral com fragrância de eucalipto.","4.90",55,"https://cdn.awsli.com.br/800x800/1775/1775051/produto/134342529/desinfetante-ype-bak-eucalipto-embalagem-12x500-ml-preco-unit-r273-241dea2f.jpg"),
    new ProductSeed("Água Sanitária Ypê 5 L","Água sanitária para higienização, branqueamento e limpeza pesada.","17.90",35,"https://www.supermercadonacional.com.br/upload/service/agua-sanitaria-ype-5-litros-1.jpg"),
    new ProductSeed("Esponja EsfreBom Multiuso 4 un.","Esponjas dupla face para louças e limpeza de superfícies.","7.60",70,"https://cdn.awsli.com.br/600x1000/153/153933/produto/22163183/839fe427a8.jpg"),
    new ProductSeed("Cif Multiuso Antibac 500 ml","Limpador multiuso para limpeza de diversas superfícies.","6.50",45,"https://destro.fbitsstatic.net/img/p/limpador-cif-multiuso-antibacteriano-20-gts-500ml-78866/265421-1.jpg?h=1000&qs=ignore&v=no-change&w=1000"),
    new ProductSeed("Lava Roupas Brilhante 3 L","Lava roupas líquido para limpeza profunda das roupas.","39.90",25,"https://images-na.ssl-images-amazon.com/images/I/71jvqKocIgL._AC_UL675_SR525%2C675_.jpg"),
    new ProductSeed("Amaciante Baby Soft 2 L","Amaciante para roupas com fragrância e toque macio.","16.90",32,"https://donizete.agilecdn.com.br/123094.png?v=542-2185524064"),
    new ProductSeed("Vassoura Condor V35","Vassoura multiuso para limpeza de pisos e ambientes domésticos.","15.99",28,"https://coobrasil.com.br/storage/uploads/ibCi6fMpLKzcbDzogMOL4013sGwQKL0BnZOPS8OJ.jpg"),
    new ProductSeed("Luva Multiuso Látex Amarela","Par de luvas para proteger as mãos durante tarefas de limpeza.","9.90",50,"https://down-br.img.susercontent.com/file/sg-11134201-822zq-mi4n77h10gef87"),
    new ProductSeed("Kit Limpeza Noviça 4 Peças","Conjunto com itens essenciais para a limpeza doméstica.","73.00",12,"https://compensamateriais.fbitsstatic.net/img/p/conjunto-de-limpeza-novica-4-pecas-bettanin-70649/257168.jpg?h=640&qs=ignore&v=no-change&w=640")
   );
   catalog.forEach(item -> upsert(products, item));
  };
 }
 private void upsert(ProductRepository products, ProductSeed s){
  Product p = products.findByName(s.name()).orElseGet(Product::new);
  boolean fresh = p.getId() == null;
  p.setName(s.name()); p.setDescription(s.description()); p.setPrice(new BigDecimal(s.price())); p.setImageUrl(s.image()); p.setActive(true);
  if(fresh) p.setStock(s.stock());
  products.save(p);
 }
 private record ProductSeed(String name,String description,String price,int stock,String image) {}
}
