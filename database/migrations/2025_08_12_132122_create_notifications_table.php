    <?php

    use Illuminate\Database\Migrations\Migration;
    use Illuminate\Database\Schema\Blueprint;
    use Illuminate\Support\Facades\Schema;

    class CreateNotificationsTable extends Migration
    {
        public function up()
        {
            Schema::create('notifications', function (Blueprint $table) {
                
                $table->id();

                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('source_user_id')->nullable();
                $table->string('titre');
                $table->text('commentaire')->nullable();
                $table->string('type')->nullable();
                $table->boolean('is_read')->default(false);
                $table->boolean('done')->default(false);
                $table->timestamp('read_at')->nullable();
                $table->timestamps();

                $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');

            });
        }

        public function down()
        {
            Schema::dropIfExists('notifications');
        }
    }