mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId, ref: 'users'
    }, text: {
        type: String, required: true
    }, name: {
        type: String
    }, avatar: {
        type: String
    }, likes: [{
        user: {
            type: Schema.Types.ObjectId, ref: 'users'
        }
    }], comments: [{
        user: {
            type: Schema.Types.ObjectId, ref: 'users'
        }, text: {
            type: String, required: true
        }, name: {
            type: String
        }, avatar: {
            type: String
        }, date: {
            type: Date, default: Date.now
        }
    }], date: {
        type: Date, default: Date.now
    }
});

module.exports = Post = mongoose.model('post', PostSchema);
/*
mongoose.model('post', PostSchema);:

mongoose.model 方法用于定义一个模型。在 Mongoose 中，模型是根据定义的模式（Schema）构建的，用于与数据库中的集合（collections）进行交互。这个方法接受两个参数：模型的名称和模型的模式。
第一个参数 'post' 是模型的名称。这个名称通常用于引用数据库中的集合。按照惯例，Mongoose 会自动查找名称为模型名称的复数形式的集合。所以，这里 'post' 会对应数据库中的 'posts' 集合。
第二个参数 PostSchema 是该模型的模式定义。PostSchema 应该是在其他地方定义的，它定义了存储在 'posts' 集合中的文档的结构，包括字段名称、类型以及其他验证或默认值等规则。
Post = mongoose.model('post', PostSchema);:

这里将 mongoose.model 方法的返回值赋值给 Post 变量。这个返回值是一个构造函数，用于创建符合 PostSchema 模式的 post 集合中的文档实例。
module.exports = Post;:

最后，这行代码通过 module.exports 将 Post 变量导出。这使得其他文件可以通过 require 方法引入 Post 模型，从而能够在应用程序的其他部分创建、查询、更新和删除 posts 集合中的文档。
*/


/*
在这个 MongoDB 或 Mongoose 模型定义中，使用中括号（[]）和大括号（{}）有着特定的含义，反映了数据结构的不同层级和类型。

大括号 {} 用于定义一个对象（在这个上下文中，是一个文档的字段）。每一对大括号内部定义了一个文档或子文档的结构，其中可以包含多个键值对。在你的例子中，text, name, avatar 等字段被定义在大括号内，表明这些是单一的字段，每个字段都有自己的类型和属性（如 type, required 等）。

中括号 [] 用于定义一个数组，表示该字段将包含一个元素列表。在你的例子中，likes 和 comments 字段使用了中括号，表明这些字段将存储一个对象数组。每个数组的元素都遵循中括号内定义的结构。例如，likes 字段是一个包含多个对象的数组，每个对象中都有一个 user 字段，该字段引用了另一个文档的 ObjectId。同样，comments 字段是一个对象数组，每个对象都有 user, text, name, avatar, 和 date 字段，且每个字段都有各自的类型和属性。

这种使用方式允许模型定义中体现出更复杂的数据结构，如数组中的对象（对象数组），以及这些对象中的字段关系和类型。在 Mongoose 中，这样的结构非常有用，因为它们允许在单个文档内部嵌套复杂的数据关系和结构，这对于文档数据库（如 MongoDB）来说是一种常见的数据组织方式。
*/